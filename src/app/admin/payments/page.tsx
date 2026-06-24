'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, CreditCard, AlertCircle, X, CheckCircle2, XCircle, DollarSign, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PaymentTransaction {
    id: string;
    user_id: string;
    reference: string;
    amount: number;
    currency: string;
    product: string;
    status: string;
    email: string | null;
    created_at: string;
    verified_at?: string | null;
    metadata?: Record<string, unknown> | null;
}

export default function AdminPaymentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [productFilter, setProductFilter] = useState('All');
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchPayments = async () => {
            const { data, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setTransactions(data as PaymentTransaction[]);
            }
            setLoading(false);
        };
        fetchPayments();
    }, [supabase]);

    const filtered = transactions.filter(t => {
        const matchesSearch = search === '' || 
            t.reference.toLowerCase().includes(search.toLowerCase()) ||
            (t.email && t.email.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesProduct = productFilter === 'All' || t.product === productFilter;

        return matchesSearch && matchesStatus && matchesProduct;
    });

    const products = useMemo(() => {
        const set = new Set(transactions.map(t => t.product).filter(Boolean));
        return Array.from(set);
    }, [transactions]);

    const stats = useMemo(() => {
        let totalRevenue = 0;
        let successfulCount = 0;
        let failedCount = 0;

        transactions.forEach(t => {
            if (t.status === 'verified') {
                totalRevenue += t.amount;
                successfulCount++;
            } else if (t.status === 'failed') {
                failedCount++;
            }
        });

        return { totalRevenue, successfulCount, failedCount };
    }, [transactions]);

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Payment Transactions</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} logged
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">KES {stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <DollarSign size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Successful Payments</p>
                        <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats.successfulCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Failed / Incomplete</p>
                        <h3 className="text-2xl font-black text-red-700 mt-1">{stats.failedCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <XCircle size={20} />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email or reference..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-slate-50/50"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="verified">Verified</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </select>

                    <select
                        value={productFilter}
                        onChange={e => setProductFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white max-w-[150px] sm:max-w-none"
                    >
                        <option value="All">All Products</option>
                        {products.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {['Customer Email', 'Product', 'Amount', 'Status', 'Reference', 'Date', ''].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                    <td className="px-5 py-4 font-semibold text-slate-800">{t.email || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-50 text-violet-700 uppercase tracking-wider">
                                            {t.product || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-extrabold text-slate-900">
                                        {t.currency || 'KES'} {t.amount.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                            t.status === 'verified'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : t.status === 'failed'
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {t.status === 'verified' ? 'Verified' : t.status === 'failed' ? 'Failed' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{t.reference}</td>
                                    <td className="px-5 py-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-gray-400" />
                                            {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {t.metadata && typeof t.metadata === 'object' && Object.keys(t.metadata).length > 0 && (
                                            <span className="text-[10px] text-gray-400 block max-w-[120px] truncate" title={JSON.stringify(t.metadata)}>
                                                {JSON.stringify(t.metadata)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
