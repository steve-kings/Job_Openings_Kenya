'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Send, AlertCircle, Loader2, CheckCircle, Clock, Trash2, Zap, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Subscriber { id: string; email: string; status: string; created_at: string; }
interface Scheduled { id: string; subject: string; send_at: string; status: string; recipient_count?: number; }

export default function NewsletterPage() {
    const [subs, setSubs] = useState<Subscriber[]>([]); const [scheduled, setScheduled] = useState<Scheduled[]>([]);
    const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false);
    const [tab, setTab] = useState<'subscribers'|'scheduled'>('subscribers');
    const [msg, setMsg] = useState<{type:'success'|'error',text:string}|null>(null);
    const s = useMemo(() => createClient(), []);

    const loadData = useCallback(async () => {
        const [subData, schData] = await Promise.all([
            s.from('subscribers').select('*').order('created_at',{ascending:false}),
            s.from('scheduled_emails').select('*').order('send_at',{ascending:false}),
        ]);
        return { subs: subData.data||[], scheduled: schData.data||[] };
    }, [s]);

    useEffect(() => {
        loadData().then(({ subs, scheduled }) => {
            setSubs(subs); setScheduled(scheduled); setLoading(false);
        });
    }, [loadData]);

    const sendNow = async () => {
        setSending(true); setMsg(null);
        try {
            const res = await fetch('/api/admin/newsletter/send', { method: 'POST' });
            const d = await res.json();
            setMsg({ type: res.ok ? 'success' : 'error', text: d.message || d.error || 'Done' });
        } catch { setMsg({ type: 'error', text: 'Failed to send' }); }
        setSending(false);
    };

    const delSub = async (id: string) => { await s.from('subscribers').delete().eq('id',id); const d = await loadData(); setSubs(d.subs); setScheduled(d.scheduled); };
    const delSch = async (id: string) => { await s.from('scheduled_emails').delete().eq('id',id); const d = await loadData(); setSubs(d.subs); setScheduled(d.scheduled); };

    const activeSubs = subs.filter(x=>x.status==='active').length;

    if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-600"/></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Newsletter</h1><p className="text-sm text-gray-500 mt-0.5">{activeSubs} active subscribers</p></div>
                <button onClick={sendNow} disabled={sending} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 disabled:opacity-50">
                    {sending?<Loader2 size={16} className="animate-spin"/>:<Send size={16}/>} Send Now
                </button>
            </div>

            {msg && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${msg.type==='success'?'bg-emerald-50 text-emerald-700 border border-emerald-100':'bg-red-50 text-red-600 border border-red-100'}`}>
                    {msg.type==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}{msg.text}
                    <button onClick={()=>setMsg(null)} className="ml-auto"><X size={14}/></button>
                </div>
            )}

            <div className="flex gap-2">
                {[
                    { key: 'subscribers' as const, label: 'Subscribers', icon: Users, count: activeSubs },
                    { key: 'scheduled' as const, label: 'Scheduled', icon: Clock, count: scheduled.length },
                ].map(({ key, label, icon: Icon, count }) => (
                    <button key={key} onClick={()=>setTab(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${tab===key?'bg-emerald-600 text-white shadow-sm':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Icon size={15}/> {label} ({count})</button>
                ))}
            </div>

            {tab === 'subscribers' ? (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100 bg-gray-50/50">
                        {['Email','Status','Subscribed',''].map(h=><th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
                    </tr></thead><tbody className="divide-y divide-gray-50">
                        {subs.map(su => (
                            <tr key={su.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{su.email}</td>
                                <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${su.status==='active'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-500'}`}>{su.status}</span></td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(su.created_at).toLocaleDateString()}</td>
                                <td className="px-5 py-3.5"><button onClick={()=>delSub(su.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14}/></button></td>
                            </tr>
                        ))}
                    </tbody></table></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {scheduled.map(sc => (
                        <div key={sc.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><Zap size={18} className="text-violet-600"/></div>
                                <div>
                                    <p className="font-extrabold text-gray-900 text-sm">{sc.subject}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(sc.send_at).toLocaleString()} · {sc.status}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {sc.recipient_count && <span className="text-xs text-gray-400">{sc.recipient_count} sent</span>}
                                <button onClick={()=>delSch(sc.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                    {scheduled.length===0&&<div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400"><Clock size={40} className="mx-auto mb-3 opacity-30"/><p className="font-semibold">No scheduled emails</p></div>}
                </div>
            )}
        </div>
    );
}
