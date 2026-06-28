'use client'

import { useParams } from 'next/navigation';
import OpportunityForm from '@/components/OpportunityForm';

export default function EditOpportunityPage() {
    const params = useParams();
    return <OpportunityForm mode="edit" opportunityId={params.id as string} />;
}
