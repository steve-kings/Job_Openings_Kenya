import { createClient } from '@/lib/supabase/server';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const revalidate = 60;

export default async function MembersPage() {
    const s = await createClient();
    const { data: profiles } = await s.from('profiles').select('*').order('created_at', { ascending: false });

    const members = profiles || [];
    const admins = members.filter(p => p.role === 'admin').length;
    const employers = members.filter(p => p.role === 'employer').length;
    const jobseekers = members.filter(p => p.role !== 'admin' && p.role !== 'employer').length;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Members</h1><p className="text-sm text-gray-500 mt-0.5">{members.length} registered · {admins} admin{admins!==1?'s':''} · {employers} employer{employers!==1?'s':''}</p></div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Job Seekers', value: jobseekers, icon: UserCheck, c: 'emerald' },
                    { label: 'Employers', value: employers, icon: ShieldCheck, c: 'blue' },
                    { label: 'Admins', value: admins, icon: ShieldCheck, c: 'red' },
                ].map(({ label, value, icon: Icon, c }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-${c}-50 flex items-center justify-center mx-auto mb-2`}><Icon size={20} className={`text-${c}-600`}/></div>
                        <p className="text-3xl font-black text-gray-900">{value}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Name','Email','Role','Joined'].map(h=><th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
                </tr></thead><tbody className="divide-y divide-gray-50">
                    {members.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-xs">{m.full_name?.[0]?.toUpperCase()||'?'}</div>
                                    <span className="font-semibold text-gray-900 text-sm">{m.full_name||'Anonymous'}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{m.email||'—'}</td>
                            <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${m.role==='admin'?'bg-red-50 text-red-700':m.role==='employer'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-600'}`}>{m.role||'user'}</span></td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{m.created_at?new Date(m.created_at).toLocaleDateString():'—'}</td>
                        </tr>
                    ))}
                </tbody></table></div>
                {members.length===0&&<div className="text-center py-16 text-gray-400"><UserCheck size={40} className="mx-auto mb-3 opacity-40"/><p className="font-semibold">No members yet</p></div>}
            </div>
        </div>
    );
}
