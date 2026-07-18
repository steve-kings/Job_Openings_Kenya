import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Editorial and Listing Policy',
    description: 'How Job Openings Kenya screens, sources, publishes, updates, and corrects job and career information.',
    alternates: { canonical: '/editorial-policy' },
};

export default function EditorialPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 py-16 sm:py-20">
            <article className="mx-auto max-w-4xl px-4 sm:px-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">Transparency</p>
                    <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Editorial and Listing Policy</h1>
                    <p className="mt-3 text-sm text-slate-500">Last updated: July 2026</p>

                    <div className="mt-10 space-y-8 leading-relaxed text-slate-700">
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">Our purpose</h2>
                            <p>Job Openings Kenya helps people discover employment, internship, training, and career-development opportunities in Kenya. We aim to make listings clear and useful while directing applicants to the responsible employer or official application channel.</p>
                        </section>
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">How listings are screened</h2>
                            <p>Employer-submitted listings may be reviewed by our team for employer identity, application destination, role details, location, deadline, and obvious warning signs. Listings from approved external feeds are screened automatically for Kenya relevance, freshness, useful content, and a valid application link. These external listings may be published without individual human review and are identified as externally sourced. No screening process can guarantee an employer, listing, or employment outcome.</p>
                        </section>
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">Sources and applications</h2>
                            <p>Listings may be submitted by employers or imported from approved, publicly available feeds. Automated external listings are labelled and include a link to their source when available. Applicants should read the original source and confirm the application destination before applying. Job Openings Kenya is normally not the hiring employer and does not make hiring decisions.</p>
                        </section>
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">Updates, expiry, and corrections</h2>
                            <p>Listings are expired automatically when their deadline passes. Imported listings may also be deactivated when they disappear from a complete source update. We remove or correct opportunities when we learn that they have been filled, changed, or are inaccurate. Employers, rights holders, and readers can request a correction or removal, and we assess reports when reliable evidence is available.</p>
                        </section>
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">Applicant safety</h2>
                            <p>Always verify the employer, original source, and application destination before sharing personal information. Never pay merely to submit a job application. Please report listings that request suspicious payments, impersonate an organization, or contain unsafe links.</p>
                        </section>
                        <section>
                            <h2 className="mb-3 text-xl font-extrabold text-slate-900">Contact the editorial team</h2>
                            <p>Email <a className="font-bold text-emerald-700 hover:underline" href="mailto:info@jobopenings.co.ke">info@jobopenings.co.ke</a> or use our <Link className="font-bold text-emerald-700 hover:underline" href="/contact">contact page</Link>. Include the listing URL and a short explanation so we can investigate it.</p>
                        </section>
                    </div>
                </div>
            </article>
        </main>
    );
}
