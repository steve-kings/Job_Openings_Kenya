'use client'

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

export function useViewMode() {
    const [view, setView] = useState<ViewMode>(() => {
        if (typeof window === 'undefined') return 'grid';
        const saved = localStorage.getItem('jok-listings-view');
        return saved === 'grid' || saved === 'list' ? saved : 'grid';
    });

    const toggleView = (v: ViewMode) => {
        setView(v);
        localStorage.setItem('jok-listings-view', v);
    };

    return { view, toggleView };
}

export default function ViewToggle({ view, onToggle }: { view: ViewMode; onToggle: (v: ViewMode) => void }) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onToggle('grid')}
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Card view"
            >
                <LayoutGrid size={16} />
            </button>
            <button
                onClick={() => onToggle('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="List view"
            >
                <List size={16} />
            </button>
        </div>
    );
}
