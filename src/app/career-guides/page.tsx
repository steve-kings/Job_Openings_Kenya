import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowRight, BookOpenCheck, BriefcaseBusiness, CheckCircle2, FileText,
    MessageSquareText, SearchCheck, ShieldAlert,
} from 'lucide-react';
import { getBaseUrl } from '@/lib/utils/url';

export const metadata: Metadata = {
    title: 'Kenya Job Application Guide: CV, Cover Letter, Safety & Interviews',
    description: 'A practical job application guide for Kenya covering vacancy checks, ATS-friendly CVs, cover letters, scam warning signs, interviews, and follow-up.',
    alternates: { canonical: '/career-guides' },
    openGraph: {
        title: 'The Practical Kenya Job Application Guide',
        description: 'Prepare stronger applications, identify warning signs, and approach interviews with a repeatable plan.',
        type: 'article',
        url: '/career-guides',
    },
};

const checklist = [
    'The employer name and application destination agree with each other.',
    'You meet the essential requirements, even if you do not match every preferred item.',
    'Your CV uses examples relevant to this role instead of a generic career objective.',
    'The deadline and requested time zone are clear.',
    'You saved the advert and application confirmation for your records.',
];

const faqs = [
    {
        question: 'Should every application use a different CV?',
        answer: 'You do not need to rebuild your CV from zero. Keep one accurate master CV, then adjust the summary, skills order, and most relevant achievements for each role. Never change qualifications or experience in a misleading way.',
    },
    {
        question: 'Is a two-page CV acceptable in Kenya?',
        answer: 'Two pages is a practical target for many early- and mid-career applicants, but relevance matters more than forcing a fixed length. A recent graduate may need one page, while an experienced specialist may need more space for relevant work and projects.',
    },
    {
        question: 'Should I include my ID number, KRA PIN, or certificates?',
        answer: 'Only provide sensitive documents when a verified employer has a legitimate reason and secure process. A first application normally does not require you to publish identity numbers inside your CV. Confirm the recipient before sending copies.',
    },
    {
        question: 'What if a vacancy asks for payment?',
        answer: 'Treat requests for an application, interview, shortlisting, training, clearance, or placement fee as a serious warning sign. Pause, verify the organization through independently found contact details, and report suspicious listings.',
    },
];

export default function CareerGuidesPage() {
    const siteUrl = getBaseUrl();
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Practical Kenya Job Application Guide',
        description: metadata.description,
        datePublished: '2026-07-18',
        dateModified: '2026-07-18',
        author: { '@type': 'Organization', name: 'Job Openings Kenya Editorial Team' },
        publisher: {
            '@type': 'Organization',
            name: 'Job Openings Kenya',
            url: siteUrl,
            logo: { '@type': 'ImageObject', url: `${siteUrl}/job_openings_kenya_logo.jpeg` },
        },
        mainEntityOfPage: `${siteUrl}/career-guides`,
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#85bb23]/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-800">
                        <BookOpenCheck size={15} className="text-[#85bb23]" /> Career guide
                    </p>
                    <h1 className="max-w-4xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
                        The Practical Kenya Job Application Guide
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                        A repeatable process for checking a vacancy, tailoring your CV, writing a focused cover letter,
                        avoiding common scams, preparing for interviews, and following up professionally.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-800">Job Openings Kenya Editorial Team</span>
                        <span>Reviewed 18 July 2026</span>
                        <Link href="/editorial-policy" className="font-bold text-[#85bb23] hover:underline">How we review content</Link>
                    </div>
                </div>
            </header>

            <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
                <nav aria-label="Guide contents" className="mb-12 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-black text-slate-900">In this guide</h2>
                    <ol className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                        {[
                            ['check-the-vacancy', '1. Check the vacancy before applying'],
                            ['cv', '2. Build a focused, readable CV'],
                            ['cover-letter', '3. Write a useful cover letter'],
                            ['safety', '4. Protect yourself from job scams'],
                            ['interview', '5. Prepare and follow up'],
                            ['tracker', '6. Track every application'],
                        ].map(([id, label]) => (
                            <li key={id}><a href={`#${id}`} className="hover:text-[#85bb23]">{label}</a></li>
                        ))}
                    </ol>
                </nav>

                <div className="space-y-12 text-slate-700">
                    <GuideSection id="check-the-vacancy" icon={SearchCheck} title="1. Check the vacancy before applying">
                        <p>Start with the employer and the work—not with the Apply button. Read the full advert once for context and a second time to separate essential requirements from preferred ones. Note the exact role title, location, deadline, reporting line, and application method.</p>
                        <p>Open the employer&apos;s official website independently and compare its name, domain, telephone details, and careers page with the advert. An application link can be genuine even when it is hosted by a recruitment platform, but the relationship should make sense and the page should clearly identify the employer or recruiter.</p>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="font-black text-slate-900">Five-minute application check</h3>
                            <ul className="mt-4 space-y-3">
                                {checklist.map(item => <li key={item} className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#85bb23]" /><span>{item}</span></li>)}
                            </ul>
                        </div>
                    </GuideSection>

                    <GuideSection id="cv" icon={FileText} title="2. Build a focused, readable CV">
                        <p>Your CV should help a recruiter quickly answer three questions: what work you can do, what evidence supports that claim, and how to contact you. Use a clear heading hierarchy, common section names, readable text, and simple spacing. Decorative graphics should never make dates, employers, or qualifications difficult to find.</p>
                        <h3 className="text-lg font-black text-slate-900">A practical section order</h3>
                        <ol className="list-decimal space-y-2 pl-6">
                            <li><strong>Contact details:</strong> name, professional phone number, email, location, and a relevant portfolio or LinkedIn link.</li>
                            <li><strong>Professional summary:</strong> two or three specific lines connecting your experience or training to the target role.</li>
                            <li><strong>Core skills:</strong> skills you can support with experience, projects, study, or certifications.</li>
                            <li><strong>Experience and projects:</strong> role, organization, dates, responsibilities, and useful outcomes.</li>
                            <li><strong>Education and training:</strong> qualification, institution, and completion date.</li>
                            <li><strong>Referees:</strong> include them only when requested, or state that they are available on request.</li>
                        </ol>
                        <p>Replace vague duties with evidence where possible. “Responsible for customer service” is less useful than “Resolved customer enquiries by phone and email and maintained an accurate follow-up log.” Use numbers only when they are true and meaningful.</p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/resources/cv-builder" className="inline-flex items-center gap-2 rounded-xl bg-[#85bb23] px-5 py-3 text-sm font-black text-white hover:brightness-90">Build a CV <ArrowRight size={15} /></Link>
                            <Link href="/dashboard/profile" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:border-[#85bb23]">Update your profile</Link>
                        </div>
                    </GuideSection>

                    <GuideSection id="cover-letter" icon={MessageSquareText} title="3. Write a useful cover letter">
                        <p>A cover letter should not repeat your entire CV. Its job is to connect the employer&apos;s need to two or three pieces of relevant evidence. Keep the opening direct: name the role and explain why your background fits it. Use the middle paragraphs for evidence, then close with availability and a professional invitation to discuss the application.</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Tip title="Useful opening">“I am applying for the Accounts Assistant position. My diploma training and experience maintaining invoices, reconciliations, and Excel records align with the role&apos;s core requirements.”</Tip>
                            <Tip title="Avoid">Generic claims such as “I am hardworking and can do any job” without an example that relates to the advertised work.</Tip>
                        </div>
                        <p>Before sending, confirm that the employer name and job title are correct. Save the document with a professional filename such as <code className="rounded bg-slate-100 px-2 py-1">Amina_Otieno_Cover_Letter.pdf</code>.</p>
                    </GuideSection>

                    <GuideSection id="safety" icon={ShieldAlert} title="4. Protect yourself from job scams">
                        <p>Urgency is not proof that a vacancy is genuine. Be cautious when someone offers a job without a normal assessment, pressures you to act immediately, moves every conversation to a personal account, or requests money for shortlisting, interviews, placement, equipment, clearance, or mandatory training.</p>
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {[
                                'Verify contact details using a source you found independently.',
                                'Do not send passwords, PINs, one-time codes, or mobile-money credentials.',
                                'Limit sensitive identity documents until the employer and purpose are verified.',
                                'Keep screenshots, emails, receipts, and the original advert when reporting a concern.',
                            ].map(item => <li key={item} className="rounded-xl border border-slate-200 bg-white p-4 font-semibold text-slate-700">{item}</li>)}
                        </ul>
                        <p>If a listing on this platform appears suspicious, use the <Link href="/contact" className="font-bold text-[#85bb23] hover:underline">contact page</Link> and include its URL. We can investigate, correct, or remove it.</p>
                    </GuideSection>

                    <GuideSection id="interview" icon={BriefcaseBusiness} title="5. Prepare for the interview and follow up">
                        <p>Review the job description again and prepare one example for each major skill. The Situation–Task–Action–Result structure can keep answers focused: briefly explain the context, your responsibility, what you did, and the outcome. If the outcome was not numerical, explain what became faster, safer, clearer, or more reliable.</p>
                        <p>Confirm the interview time, location or meeting link, expected format, contact person, and documents required. Test online interview audio and connectivity early. For an in-person meeting, plan the route and arrive with enough time to settle without creating pressure on the interviewer.</p>
                        <h3 className="text-lg font-black text-slate-900">Questions worth preparing</h3>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Why does this role interest you, and what relevant problem have you solved before?</li>
                            <li>Which achievement best demonstrates the skill this vacancy prioritizes?</li>
                            <li>What would you need to learn during your first weeks?</li>
                            <li>What questions will you ask about expectations, reporting, and the hiring timeline?</li>
                        </ul>
                        <p>After the interview, send a short thank-you message when you have an appropriate contact. Refer to the role, thank the interviewer for their time, and confirm your continued interest. Avoid repeated daily follow-ups; use the timeline the employer provided.</p>
                    </GuideSection>

                    <GuideSection id="tracker" icon={BookOpenCheck} title="6. Track every application">
                        <p>A simple tracker prevents duplicate applications and helps you follow up at the right time. Record the employer, role, source URL, date applied, deadline, document version, contact person, current status, next action, and notes. Save a copy of the vacancy because external pages may change or disappear.</p>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-slate-100 text-slate-900"><tr><th className="p-3">Role</th><th className="p-3">Applied</th><th className="p-3">Status</th><th className="p-3">Next action</th></tr></thead>
                                <tbody><tr className="border-t border-slate-200"><td className="p-3">Example: Procurement Assistant</td><td className="p-3">18 Jul</td><td className="p-3">Submitted</td><td className="p-3">Follow up after stated review period</td></tr></tbody>
                            </table>
                        </div>
                        <Link href="/dashboard/applications" className="inline-flex items-center gap-2 font-black text-[#85bb23] hover:underline">Open your application tracker <ArrowRight size={15} /></Link>
                    </GuideSection>

                    <section aria-labelledby="faq-heading" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h2 id="faq-heading" className="text-2xl font-black text-slate-950">Frequently asked questions</h2>
                        <div className="mt-6 divide-y divide-slate-200">
                            {faqs.map(item => (
                                <details key={item.question} className="group py-4">
                                    <summary className="cursor-pointer list-none pr-6 font-black text-slate-900">{item.question}</summary>
                                    <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </article>
        </main>
    );
}

function GuideSection({ id, icon: Icon, title, children }: {
    id: string;
    icon: typeof FileText;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#85bb23]/10 text-[#85bb23]"><Icon size={22} /></span>
                <h2 className="text-2xl font-black text-slate-950">{title}</h2>
            </div>
            <div className="space-y-5 leading-7">{children}</div>
        </section>
    );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></div>;
}
