'use client'

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, ExternalLink, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Partner { id: string; name: string; website_url?: string; logo_url?: string; created_at: string; }

export default function AdminPartnersPage() {
    const [search, setSearch] = useState(''); const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true); const s = useMemo(() => createClient(), []);

    useEffect(() => { s.from('partners').select('*').order('created_at',{ascending:false}).then(({data}) => { setPartners(data||[]); setLoading(false); }); }, [s]);

    const del = async (id: string) => { if (!confirm('Delete?')) return; await s.from('partners').delete().eq('id',id); setPartners(prev => prev.filter(p => p.id !== id)); };

    const filtered = partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Partners</h1><p className="text-sm text-gray-500 mt-0.5">{partners.length} partner{partners.length!==1?'s':''}</p></div>
                <Link href="/admin/partners/create" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"><Plus size={16} /> Add Partner</Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="relative max-w-md"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search partners..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />{search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>}</div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">{p.name.charAt(0).toUpperCase()}</div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/admin/partners/${p.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit size={14}/></Link>
                                <button onClick={()=>del(p.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <h3 className="font-extrabold text-gray-900">{p.name}</h3>
                        {p.website_url && <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">Website <ExternalLink size={10}/></a>}
                        <p className="text-[10px] text-gray-400 mt-3">Added {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                ))}
                {filtered.length===0&&<div className="col-span-full text-center py-16 text-gray-400"><AlertCircle size={40} className="mx-auto mb-3 opacity-40"/><p className="font-semibold">No partners found</p></div>}
            </div>
        </div>
    );
}
