'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    Search, MapPin, Briefcase, BookOpen, Layers,
    LocateFixed, Loader2, Wallet
} from 'lucide-react';

const categories = [
    { value: 'All', label: 'All', icon: Layers },
    { value: 'Job', label: 'Jobs', icon: Briefcase },
    { value: 'Training', label: 'Training', icon: BookOpen },
];

const popularLocations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Remote'];

export default function JobsFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [type, setType] = useState(searchParams.get('type') || 'All');
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [salaryMin, setSalaryMin] = useState(searchParams.get('salary_min') || '');
    const [salaryMax, setSalaryMax] = useState(searchParams.get('salary_max') || '');
    const [detecting, setDetecting] = useState(false);
    const [detectError, setDetectError] = useState('');

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === 'All') params.delete('type');
        else params.set('type', type);
        if (!query.trim()) params.delete('q');
        else params.set('q', query.trim());
        if (!location) params.delete('location');
        else params.set('location', location);
        if (!salaryMin) params.delete('salary_min');
        else params.set('salary_min', salaryMin);
        if (!salaryMax) params.delete('salary_max');
        else params.set('salary_max', salaryMax);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [type, query, location, salaryMin, salaryMax, router, pathname, searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => applyFilters(), 400);
        return () => clearTimeout(timer);
    }, [query, applyFilters]);

    useEffect(() => { applyFilters(); }, [type, location, salaryMin, salaryMax, applyFilters]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setDetectError('Geolocation not supported.');
            return;
        }
        setDetecting(true);
        setDetectError('');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&accept-language=en`
                    );
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state;
                    if (!city) {
                        setDetectError('Could not determine your city.');
                        setDetecting(false);
                        return;
                    }
                    const matched = popularLocations.find(l => l.toLowerCase() === city.toLowerCase())
                        || popularLocations.find(l => city.toLowerCase().includes(l.toLowerCase()));
                    if (matched) setLocation(matched);
                    else setDetectError(`Detected "${city}" — please select manually.`);
                } catch {
                    setDetectError('Location lookup failed.');
                } finally { setDetecting(false); }
            },
            (err) => {
                setDetecting(false);
                setDetectError(err.code === 1 ? 'Location permission denied.' : 'Unable to detect location.');
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Main search row */}
            <div className="flex items-center gap-2 p-2.5 sm:p-4">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 border border-transparent transition-all">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Job title, keyword, or company..."
                        className="w-full bg-transparent text-[15px] text-slate-800 placeholder-slate-400 outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="shrink-0 text-slate-300 hover:text-slate-500">
                            <Layers size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-1.5 px-2.5 sm:px-4 pb-2.5 sm:pb-4 border-t border-slate-50 pt-2.5">
                {/* Type pills */}
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const active = type === cat.value;
                    return (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setType(cat.value)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                active
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                        >
                            <Icon size={13} />
                            {cat.label}
                        </button>
                    );
                })}

                <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" />

                {/* Location */}
                <div className="relative flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <select
                        className="bg-transparent text-xs font-semibold text-slate-600 outline-none appearance-none cursor-pointer pr-4"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="">Any location</option>
                        {popularLocations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    {!location && (
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={detecting}
                            title="Detect my location"
                            className="shrink-0 p-0.5 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                            {detecting ? <Loader2 size={11} className="animate-spin" /> : <LocateFixed size={11} />}
                        </button>
                    )}
                </div>

                {/* Salary */}
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5">
                    <Wallet size={13} className="text-slate-400 shrink-0" />
                    <input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="w-12 sm:w-16 bg-transparent text-xs font-semibold text-slate-600 placeholder-slate-400 outline-none"
                    />
                    <span className="text-slate-300 text-xs">–</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="w-12 sm:w-16 bg-transparent text-xs font-semibold text-slate-600 placeholder-slate-400 outline-none"
                    />
                </div>
            </div>

            {detectError && (
                <p className="px-4 pb-2 text-[11px] text-red-500 font-medium">{detectError}</p>
            )}
        </div>
    );
}
