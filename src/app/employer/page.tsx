import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle, Building2, Users, Clock, ArrowRight, FileText, Eye, Zap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Employer Portal — Post a Job | Job Openings Kenya',
    description: 'Post your job openings on Job Openings Kenya and reach thousands of qualified Kenyan job seekers. Fast, simple, and reviewed by our team.',
};

const steps = [
    {
        number: '01',
        icon: Building2,
        title: 'Create Your Account',
        description: 'Sign up as an employer in under 2 minutes. No credit card required.',
        color: '#5CB800',
    },
    {
        number: '02',
        icon: FileText,
        title: 'Fill the Job Form',
        description: 'Describe the role, requirements, location, and how to apply.',
        color: '#4A9900',
    },
    {
        number: '03',
        icon: Eye,
        title: 'Admin Reviews',
        description: 'Our team reviews your posting within 24 hours to ensure quality.',
        color: '#5CB800',
    },
    {
        number: '04',
        icon: Zap,
        title: 'Goes Live!',
        description: 'Your job reaches thousands of active job seekers across Kenya.',
        color: '#4A9900',
    },
];

const benefits = [
    'Reach thousands of active Kenyan job seekers daily',
    'Free job posting — no hidden fees',
    'Jobs reviewed & published within 24 hours',
    'Listings appear on homepage & search results',
    'Access to talent directory to find candidates',
    'Manage all your postings from your dashboard',
];

export default function EmployerLandingPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-[#5CB800] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#4A9900] rounded-full blur-2xl"></div>
                </div>
                <div className="container mx-auto px-6 lg:px-12 py-20 lg:py-32 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-[#5CB800]/20 border border-[#5CB800]/30 text-[#5CB800] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <Building2 size={16} />
                            Employer Portal
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Hire the Best Talent in <span className="text-[#5CB800]">Kenya</span>
                        </h1>
                        <p className="text-xl text-white/80 leading-relaxed mb-10">
                            Post your job openings on Job Openings Kenya and connect with thousands of qualified, motivated job seekers. Free to post. Live in 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login?role=employer"
                                className="btn bg-[#5CB800] hover:bg-[#4A9900] text-white border-none btn-lg gap-2 shadow-xl"
                            >
                                Create Employer Account
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/login?redirect=/employer/dashboard"
                                className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 btn-lg gap-2"
                            >
                                Sign In to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="bg-[#5CB800] text-white py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: '10,000+', label: 'Active Job Seekers' },
                            { value: '24hrs', label: 'Average Review Time' },
                            { value: 'Free', label: 'Cost to Post' },
                            { value: '100%', label: 'Kenya Focused' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p className="text-3xl font-black">{value}</p>
                                <p className="text-white/80 text-sm mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Getting your job in front of the right candidates takes just 4 simple steps
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.number} className="relative">
                                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 h-full">
                                        <div className="text-5xl font-black text-gray-100 mb-4">{step.number}</div>
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${step.color}15` }}>
                                            <Icon size={28} style={{ color: step.color }} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Post on Job Openings Kenya?</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We connect Kenya's top employers with motivated, qualified job seekers who are actively looking for their next opportunity.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={22} className="text-[#5CB800] shrink-0 mt-0.5" />
                                        <span className="text-gray-700 font-medium">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] rounded-3xl p-10 text-white shadow-2xl">
                            <Users size={48} className="mb-6 opacity-90" />
                            <h3 className="text-3xl font-bold mb-4">Ready to Find Your Next Hire?</h3>
                            <p className="text-white/80 mb-8 text-lg leading-relaxed">
                                Join hundreds of Kenyan companies already posting on our platform. Create your free employer account today.
                            </p>
                            <Link
                                href="/login?role=employer"
                                className="btn bg-white text-[#5CB800] hover:bg-gray-100 border-none btn-lg gap-2 w-full font-bold shadow-lg"
                            >
                                Get Started — It's Free
                                <ArrowRight size={20} />
                            </Link>
                            <p className="text-center text-white/60 text-sm mt-4">
                                Already have an account?{' '}
                                <Link href="/login?redirect=/employer/dashboard" className="text-white underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Start Hiring Today</h2>
                    <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
                        Post your first job for free and see why Kenya's top companies choose Job Openings Kenya.
                    </p>
                    <Link
                        href="/login?role=employer"
                        className="btn bg-[#5CB800] hover:bg-[#4A9900] text-white border-none btn-lg gap-2"
                    >
                        Post a Job Now
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
