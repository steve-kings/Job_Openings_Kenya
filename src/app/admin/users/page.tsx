'use client'

import { useState, useEffect, useMemo } from 'react';
import { Search, UserCheck, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile { id: string; full_name?: string; email?: string; role: string; created_at: string; }

export default function AdminUsersPage() {
    const [search, setSearch] = useState(''); const [roleFilter, setRoleFilter] = useState('All');
    const [users, setUsers] = useState<Profile[]>([]); const [loading, setLoading] = useState(true);
    const s = useMemo(() => createClient(), []);

    useEffect(() => { s.from('profiles').select('*').order('created_at',{ascending:false}).then(({data}) => { setUsers(data||[]); setLoading(false); }); }, [s]);

    const filtered = users.filter(u => {
        const m = (u.full_name||'').toLowerCase().includes(search.toLowerCase()) || (u.email||'').toLowerCase().includes(search.toLowerCase());
        return m && (roleFilter === 'All' || u.role === roleFilter);
    });

    const admins = users.filter(u => u.role === 'admin').length;

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Users</h1><p className="text-sm text-gray-500 mt-0.5">{users.length} registered · {admins} admin{admins!==1?'s':''}</p></div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />{search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>}</div>
                <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white"><option value="All">All Roles</option><option value="user">User</option><option value="admin">Admin</option><option value="employer">Employer</option></select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Name','Email','Role','Joined'].map(h=><th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
                </tr></thead><tbody className="divide-y divide-gray-50">
                    {filtered.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-xs">{u.full_name?.[0]?.toUpperCase() || '?'}</div>
                                    <span className="font-semibold text-gray-900 text-sm">{u.full_name || 'Anonymous'}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{u.email || '—'}</td>
                            <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.role==='admin'?'bg-red-50 text-red-700':u.role==='employer'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody></table></div>
                {filtered.length===0&&<div className="text-center py-16 text-gray-400"><UserCheck size={40} className="mx-auto mb-3 opacity-40"/><p className="font-semibold">No users found</p></div>}
            </div>
        </div>
    );
}
