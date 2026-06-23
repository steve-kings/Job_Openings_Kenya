'use client'

import { Search } from 'lucide-react';

export default function CompanySearch() {
    return (
        <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Search companies..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    document.querySelectorAll('[data-company-card]').forEach((card) => {
                        const name = card.getAttribute('data-company-name')?.toLowerCase() || '';
                        (card as HTMLElement).style.display = name.includes(val) ? '' : 'none';
                    });
                }}
            />
        </div>
    );
}
