'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Trash2, Quote, Loader2 } from 'lucide-react';

interface Testimonial { id: string; name: string; role?: string; company?: string; content: string; status: string; featured: boolean; created_at: string; }

export default function AdminTestimonialsPage() {
    const [items, setItems] = useState<Testimonial[]>([]); const [loading, setLoading] = useState(true);
    const s = useMemo(() => createClient(), []);

    const loadData = useCallback(async () => { const { data } = await s.from('testimonials').select('*').order('created_at',{ascending:false}); return data||[]; }, [s]);
    useEffect(() => { loadData().then(d => { setItems(d); setLoading(false); }); }, [loadData]);

    const update = async (id: string, vals: Record<string,unknown>) => { await s.from('testimonials').update(vals).eq('id',id); const d = await loadData(); setItems(d); };
    const del = async (id: string) => { if (!confirm('Delete?')) return; await s.from('testimonials').delete().eq('id',id); const d = await loadData(); setItems(d); };

    const pending = items.filter(t=>t.status==='pending').length;
    const approved = items.filter(t=>t.status==='approved').length;

    if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Testimonials</h1><p className="text-sm text-gray-500 mt-0.5">{approved} approved · {pending} pending review</p></div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(t => (
                    <div key={t.id} className={`bg-white rounded-2xl border p-5 transition-all ${t.status==='pending'?'border-amber-200 bg-amber-50/30':'border-gray-100'} hover:shadow-md`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${t.status==='approved'?'bg-emerald-50 text-emerald-700':t.status==='rejected'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-700'}`}>{t.status}</span>
                            <div className="flex gap-1">
                                {t.status !== 'approved' && <button onClick={()=>update(t.id,{status:'approved'})} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Approve"><CheckCircle size={14}/></button>}
                                {t.status !== 'rejected' && <button onClick={()=>update(t.id,{status:'rejected'})} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Reject"><XCircle size={14}/></button>}
                                <button onClick={()=>del(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Quote size={20} className="text-emerald-300 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{t.content}</p>
                                <div className="mt-3 pt-3 border-t border-gray-50">
                                    <p className="font-extrabold text-gray-900 text-sm">{t.name}</p>
                                    {(t.role || t.company) && <p className="text-xs text-gray-500 mt-0.5">{[t.role,t.company].filter(Boolean).join(' · ')}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {items.length===0&&<div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400"><Quote size={40} className="mx-auto mb-3 opacity-30"/><p className="font-semibold">No testimonials yet</p></div>}
        </div>
    );
}
