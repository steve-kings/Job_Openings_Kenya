'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Wind, Droplets, Eye, Sunrise, Sunset, Thermometer, Loader2, Send, Bot, User, Sparkles, Compass, Gauge, CloudSun } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

interface CurrentWeather {
    temp: number; feels_like: number; humidity: number; wind: number;
    description: string; icon: string; city: string; country: string;
    pressure: number; visibility: number; sunrise: number; sunset: number;
}
interface DailyForecast {
    date: string; temp_min: number; temp_max: number; temp_avg: number;
    icon: string; description: string; humidity: number; wind: number;
}
type ChatMessage = { role: 'user' | 'assistant'; content: string };

const KENYAN_CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri', 'Malindi', 'Kitale', 'Machakos', 'Garissa'];

const WEATHER_BG: Record<string, { from: string; to: string; accent: string }> = {
    '01d': { from: '#0ea5e9', to: '#38bdf8', accent: '#fbbf24' },
    '01n': { from: '#1e1b4b', to: '#312e81', accent: '#818cf8' },
    '02d': { from: '#38bdf8', to: '#7dd3fc', accent: '#fbbf24' },
    '02n': { from: '#1e293b', to: '#334155', accent: '#818cf8' },
    '03d': { from: '#64748b', to: '#94a3b8', accent: '#e2e8f0' },
    '03n': { from: '#1e293b', to: '#334155', accent: '#64748b' },
    '04d': { from: '#475569', to: '#64748b', accent: '#94a3b8' },
    '04n': { from: '#0f172a', to: '#1e293b', accent: '#475569' },
    '09d': { from: '#475569', to: '#3b82f6', accent: '#93c5fd' },
    '09n': { from: '#1e1b4b', to: '#1e3a5f', accent: '#60a5fa' },
    '10d': { from: '#2563eb', to: '#4f46e5', accent: '#a5b4fc' },
    '10n': { from: '#0f172a', to: '#1e1b4b', accent: '#6366f1' },
    '11d': { from: '#4c1d95', to: '#475569', accent: '#fbbf24' },
    '11n': { from: '#1a1025', to: '#0f172a', accent: '#fbbf24' },
    '13d': { from: '#e2e8f0', to: '#bfdbfe', accent: '#3b82f6' },
    '13n': { from: '#1e293b', to: '#1e3a5f', accent: '#93c5fd' },
    '50d': { from: '#94a3b8', to: '#cbd5e1', accent: '#64748b' },
    '50n': { from: '#334155', to: '#475569', accent: '#64748b' },
};

const DEFAULT_BG = { from: '#0ea5e9', to: '#38bdf8', accent: '#fbbf24' };

export default function WeatherPage() {
    const [city, setCity] = useState('Nairobi');
    const [search, setSearch] = useState('');
    const [current, setCurrent] = useState<CurrentWeather | null>(null);
    const [forecast, setForecast] = useState<DailyForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // AI Chat
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{
        role: 'assistant',
        content: "Hi! Ask me anything about the weather — best time to travel, what to wear, farming tips, or conditions in any Kenyan city. 🌤️"
    }]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchWeather = useCallback(async (cityName: string) => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setCurrent(data.current);
            setForecast(data.daily);
        } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load weather'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchWeather(city); }, [city, fetchWeather]);

    // Auto-detect location: GPS → IP → Nairobi
    useEffect(() => {
        let cancelled = false;
        async function detect() {
            let detected: string | null = null;

            // 1. Try GPS
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: true });
                    });
                    const r = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&limit=1&appid=8ec2d7c6eb5d73ff469f78dff47cdd3c`);
                    if (r.ok) {
                        const d = await r.json();
                        detected = d?.[0]?.name || null;
                    }
                } catch {}
            }

            // 2. Fallback to IP
            if (!detected && !cancelled) {
                try {
                    const r = await fetch('https://ipapi.co/json/');
                    const d = await r.json();
                    detected = d.city || null;
                } catch {}
            }

            if (!cancelled && detected) {
                setCity(detected);
            }
        }
        detect();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (search.trim()) { setCity(search.trim()); setSearch(''); } };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;
        const userMsg = chatInput.trim(); setChatInput('');
        const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMsgs); setChatLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    messages: [
                        { role: 'system', content: `You are a helpful weather assistant for Kenya. Current: ${current?.city || 'Nairobi'}, ${current?.temp || '?'}°C, ${current?.description || 'unknown'}. Answer weather questions concisely (2-4 sentences) — travel tips, outfit advice, farming, safety.` },
                        ...newMsgs.map(m => ({ role: m.role, content: m.content })).slice(-6),
                    ],
                }),
            });
            const data = await res.json();
            setMessages([...newMsgs, { role: 'assistant', content: data.reply || 'Sorry, could not respond.' }]);
        } catch { setMessages([...newMsgs, { role: 'assistant', content: 'Connection error. Try again.' }]); }
        finally { setChatLoading(false); }
    };

    const formatTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (d: string) => {
        const dt = new Date(d);
        const today = new Date();
        if (dt.toDateString() === today.toDateString()) return 'Today';
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        if (dt.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const iconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@4x.png`;
    const bg = current ? (WEATHER_BG[current.icon] || DEFAULT_BG) : DEFAULT_BG;

    // Temperature bar scale
    const allTemps = forecast.flatMap(d => [d.temp_min, d.temp_max]);
    const tempRange = { min: Math.min(...allTemps, current?.temp || 0) - 2, max: Math.max(...allTemps, current?.temp || 0) + 2 };
    const tempBarPct = (t: number) => Math.max(5, Math.min(100, ((t - tempRange.min) / (tempRange.max - tempRange.min)) * 100));

    return (
        <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${bg.from} 0%, ${bg.to} 40%, #f8fafc 60%)` }}>
            {/* ═══════ HERO DASHBOARD ═══════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
                <ScrollReveal>
                    {/* Top bar: Brand + search */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <CloudSun size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow">Weather Dashboard</h1>
                                <p className="text-xs text-white/60">Real-time forecast for Kenya</p>
                            </div>
                        </div>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search city..."
                                    className="w-full sm:w-52 pl-10 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-sm outline-none focus:bg-white/20 focus:border-white/40 transition-all" />
                            </div>
                            <button type="submit" className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-bold hover:bg-white/25 transition-all">Go</button>
                        </form>
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className="flex items-center justify-center py-32"><Loader2 size={40} className="animate-spin text-white/60" /></div>
                ) : error ? (
                    <div className="text-center py-32 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                        <p className="text-white/70 text-lg mb-3">{error}</p>
                        <button onClick={() => fetchWeather(city)} className="px-5 py-2.5 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-all">Retry</button>
                    </div>
                ) : current && (
                    <>
                        {/* ═══════ MAIN DASHBOARD GRID ═══════ */}
                        <div className="grid lg:grid-cols-3 gap-5">
                            {/* Current Weather — Large Card */}
                            <ScrollReveal className="lg:col-span-1">
                                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 text-center shadow-2xl h-full flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 text-white/60 text-sm font-bold mb-2">
                                        <MapPin size={14} /> {current.city}, {current.country}
                                    </div>
                                    <img src={iconUrl(current.icon)} alt={current.description} className="w-28 h-28 mx-auto -my-3 drop-shadow-xl" />
                                    <p className="text-7xl sm:text-8xl font-black text-white tracking-tighter">{current.temp}°</p>
                                    <p className="text-white/70 text-base font-bold capitalize mt-1">{current.description}</p>
                                    <p className="text-white/40 text-xs mt-0.5">Feels like {current.feels_like}°C</p>

                                    {/* Sun times */}
                                    <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Sunrise size={16} className="text-amber-300" />
                                            <div className="text-left">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Sunrise</p>
                                                <p className="text-sm font-extrabold text-white">{formatTime(current.sunrise)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Sunset size={16} className="text-orange-300" />
                                            <div className="text-left">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Sunset</p>
                                                <p className="text-sm font-extrabold text-white">{formatTime(current.sunset)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* 5-Day Forecast + Metrics */}
                            <ScrollReveal delay={100} className="lg:col-span-2">
                                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-5 sm:p-7 shadow-2xl h-full">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-sm font-extrabold text-white">5-Day Forecast</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {KENYAN_CITIES.slice(0, 6).map(c => (
                                                <button key={c} onClick={() => setCity(c)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        city === c ? 'bg-white text-slate-900' : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                    }`}>{c}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Temp bar chart style forecast */}
                                    <div className="space-y-3">
                                        {forecast.map((day, i) => (
                                            <div key={day.date} className="flex items-center gap-3 group">
                                                <p className="w-16 text-xs font-bold text-white/70">{formatDate(day.date)}</p>
                                                <img src={iconUrl(day.icon)} alt={day.description} className="w-7 h-7 shrink-0" />
                                                <p className="w-10 text-right text-xs font-bold text-white/50">{day.temp_min}°</p>
                                                {/* Temperature bar */}
                                                <div className="flex-1 relative h-6">
                                                    <div className="absolute inset-y-0 rounded-full bg-white/5" style={{
                                                        left: `${tempBarPct(day.temp_min)}%`,
                                                        right: `${100 - tempBarPct(day.temp_max)}%`
                                                    }}>
                                                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400 opacity-80" />
                                                    </div>
                                                </div>
                                                <p className="w-10 text-xs font-extrabold text-white">{day.temp_max}°</p>
                                                <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/40 w-28 justify-end">
                                                    <span className="flex items-center gap-0.5"><Droplets size={9} />{day.humidity}%</span>
                                                    <span className="flex items-center gap-0.5"><Wind size={9} />{day.wind}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Metrics row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
                                        {[
                                            { icon: Droplets, label: 'Humidity', value: `${current.humidity}%` },
                                            { icon: Wind, label: 'Wind', value: `${current.wind} m/s` },
                                            { icon: Eye, label: 'Visibility', value: `${(current.visibility / 1000).toFixed(1)} km` },
                                            { icon: Gauge, label: 'Pressure', value: `${current.pressure} hPa` },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="text-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                                                <Icon size={16} className="mx-auto text-white/40 mb-1.5" />
                                                <p className="text-xs font-extrabold text-white">{value}</p>
                                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-0.5">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </>
                )}
            </div>

            {/* ═══════ AI CHAT SECTION ═══════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <ScrollReveal delay={200}>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <Sparkles size={15} className="text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-900">Weather AI Assistant</h3>
                                    <p className="text-[11px] text-slate-400">Powered by AI — ask anything about weather</p>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(!chatOpen)}
                                className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">
                                {chatOpen ? 'Hide' : 'Ask AI'}
                            </button>
                        </div>

                        {chatOpen && (
                            <div className="border-t border-slate-50">
                                <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                            </div>
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center"><Bot size={12} className="text-slate-400" /></div>
                                            <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex gap-1 shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={handleChat} className="p-3 border-t border-slate-100 flex gap-2">
                                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                                        placeholder="Ask about weather, travel, farming..."
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all" />
                                    <button type="submit" disabled={!chatInput.trim() || chatLoading}
                                        className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40"><Send size={16} /></button>
                                </form>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
