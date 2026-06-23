'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Droplets, Wind, ArrowRight, Loader2, Navigation } from 'lucide-react';

interface WeatherData {
    temp: number; description: string; icon: string; city: string;
    humidity: number; wind: number;
}

function getCoords(): Promise<{ lat: number; lon: number } | null> {
    return new Promise(resolve => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 5000, enableHighAccuracy: true }
        );
    });
}

async function getCityFromCoords(lat: number, lon: number): Promise<string | null> {
    try {
        const r = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''}`);
        if (!r.ok) return null;
        const d = await r.json();
        return d?.[0]?.name || null;
    } catch { return null; }
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [detecting, setDetecting] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function detect() {
            let city: string | null = null;

            // 1. Try GPS
            const coords = await getCoords();
            if (coords && !cancelled) {
                city = await getCityFromCoords(coords.lat, coords.lon);
            }

            // 2. Fallback to IP
            if (!city && !cancelled) {
                try {
                    const r = await fetch('https://ipapi.co/json/');
                    const d = await r.json();
                    city = d.city || null;
                } catch {}
            }

            // 3. Default
            if (!city) city = 'Nairobi';
            if (cancelled) return;

            setDetecting(false);

            // Fetch weather
            try {
                const url = coords
                    ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
                    : `/api/weather?city=${encodeURIComponent(city)}`;
                const r = await fetch(url);
                const data = await r.json();
                if (!cancelled && data.current) setWeather(data.current);
            } catch {}
            if (!cancelled) setLoading(false);
        }
        detect();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 py-3 justify-center">
                    {detecting ? (
                        <>
                            <Navigation size={14} className="text-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-400 font-medium">Detecting location...</span>
                        </>
                    ) : (
                        <Loader2 size={16} className="animate-spin text-slate-300" />
                    )}
                </div>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Navigation size={11} className="text-emerald-500" /> {weather.city}
                </div>
                <Link href="/weather"
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight size={10} />
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="w-14 h-14 -m-2"
                />
                <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{weather.temp}°</p>
                    <p className="text-[11px] text-slate-400 capitalize font-medium">{weather.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Droplets size={10} /> {weather.humidity}%
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Wind size={10} /> {weather.wind} m/s
                </span>
                <Link href="/weather"
                    className="ml-auto text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                    More <ArrowRight size={10} />
                </Link>
            </div>
        </div>
    );
}
