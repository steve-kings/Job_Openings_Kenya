'use client'

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Post { id: string; title: string; slug: string; status: string; category?: string; author_name?: string; created_at: string; views?: number; }

export default function AdminBlogPage() {
    const [search, setSearch] = useState(''); const [statusFilter, setStatusFilter] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]); const [loading, setLoading] = useState(true);
    const s = useMemo(() => createClient(), []);

    useEffect(() => { s.from('blog_posts').select('*').order('created_at',{ascending:false}).then(({data}) => { setPosts(data||[]); setLoading(false); }); }, [s]);

    const del = async (id: string) => { if (!confirm('Delete?')) return; await s.from('blog_posts').delete().eq('id',id); setPosts(prev => prev.filter(p => p.id !== id)); };

    const filtered = posts.filter(p => {
        return (search === '' || p.title.toLowerCase().includes(search.toLowerCase())) && (statusFilter === 'All' || p.status === statusFilter);
    });

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Blog Posts</h1><p className="text-sm text-gray-500 mt-0.5">{posts.length} total · {posts.filter(p=>p.status==='published').length} published</p></div>
                <Link href="/admin/blog/create" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"><Plus size={16} /> New Post</Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search posts..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />{search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>}</div>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white"><option value="All">All</option><option value="published">Published</option><option value="draft">Draft</option></select>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100 bg-gray-50/50">{['Title','Category','Author','Status','Date',''].map(h=><th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(p=>(<tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5"><Link href={`/admin/blog/${p.id}`} className="font-semibold text-gray-900 text-sm hover:text-emerald-700 line-clamp-1 max-w-[250px] block">{p.title}</Link></td>
                            <td className="px-5 py-3.5"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-50 text-violet-700">{p.category||'General'}</span></td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{p.author_name||'—'}</td>
                            <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${p.status==='published'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.status}</span></td>
                            <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-3.5"><div className="flex gap-1"><Link href={`/admin/blog/${p.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit size={14}/></Link><button onClick={()=>del(p.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14}/></button></div></td>
                        </tr>))}
                    </tbody></table></div>
                {filtered.length===0&&<div className="text-center py-16 text-gray-400"><AlertCircle size={40} className="mx-auto mb-3 opacity-40"/><p className="font-semibold">No posts found</p></div>}
            </div>
        </div>
    );
}
