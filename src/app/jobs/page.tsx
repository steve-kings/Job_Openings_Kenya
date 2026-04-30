import { redirect } from 'next/navigation';

export default async function JobsRedirectPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    
    if (queryString) {
        redirect(`/?${queryString}`);
    } else {
        redirect('/');
    }
}
