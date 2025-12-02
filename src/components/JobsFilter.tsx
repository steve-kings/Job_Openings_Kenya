'use client'

import { useRouter, useSearchParams } from 'next/navigation';

export default function JobsFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentType = searchParams.get('type') || 'All';

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (type === 'All') {
            params.delete('type');
        } else {
            params.set('type', type);
        }

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 mt-4 md:mt-0">
            <select
                className="select select-bordered w-full max-w-xs"
                value={currentType}
                onChange={handleFilterChange}
            >
                <option value="All">All Types</option>
                <option value="Job">Jobs</option>
                <option value="Grant">Grants</option>
                <option value="Scholarship">Scholarships</option>
                <option value="Training">Trainings</option>
            </select>
        </div>
    );
}
