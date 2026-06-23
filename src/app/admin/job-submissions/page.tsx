'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, MapPin, Building2, Loader2, AlertCircle } from 'lucide-react';

interface Sub { id: string; job_title: string; company_name: string; location: string; status: string; created_at: string; employer_id?: string; }

export default function JobSubmissionsPage() {
    const [items, setItems] = useState<Sub[]>([]); const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); const s = useMemo(() => createClient(), []);

    const loadData = useCallback(async () => { const { data } = await s.from('employer_job_submissions').select('*').order('created_at',{ascending:false}); return data||[]; }, [s]);
    useEffect(() => { loadData().then(d => { setItems(d); setLoading(false); }); }, [loadData]);

    const update = async (id: string, status: string) => { await s.from('employer_job_submissions').update({status}).eq('id',id); const d = await loadData(); setItems(d); };

    const filtered = statusFilter === 'All' ? items : items.filter(i => i.status === statusFilter);
    const pending = items.filter(i=>i.status==='pending').length;

    if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-600"/></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Job Submissions</h1><p className="text-sm text-gray-500 mt-0.5">Employer-submitted jobs · {pending} pending review</p></div>

            <div className="flex gap-2 flex-wrap">
                {['All','pending','approved','rejected'].map(s => (
                    <button key={s} onClick={()=>setStatusFilter(s)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${statusFilter===s?'bg-emerald-600 text-white shadow-sm':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s} {s!=='All'&&`(${items.filter(i=>i.status===s).length})`}</button>
                ))}
            </div>

            <div className="space-y-3">
                {filtered.map(s => (
                    <div key={s.id} className={`bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${s.status==='pending'?'border-amber-200 bg-amber-50/20':s.status==='approved'?'border-emerald-100':'border-gray-100'} hover:shadow-md`}>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${s.status==='approved'?'bg-emerald-50 text-emerald-700':s.status==='rejected'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-700'}`}>{s.status}</span>
                            </div>
                            <h3 className="font-extrabold text-gray-900">{s.job_title}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5 font-medium text-gray-700"><Building2 size={13}/> {s.company_name}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={13}/> {s.location}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Submitted {new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                        {s.status === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                                <button onClick={()=>update(s.id,'approved')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all"><CheckCircle2 size={13}/> Approve</button>
                                <button onClick={()=>update(s.id,'rejected')} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"><XCircle size={13}/> Reject</button>
                            </div>
                        )}
                    </div>
                ))}
                {filtered.length===0&&<div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400"><AlertCircle size={40} className="mx-auto mb-3 opacity-40"/><p className="font-semibold">No submissions</p></div>}
            </div>
        </div>
    );
}
