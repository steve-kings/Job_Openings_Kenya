'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'jobopeningskenya_cookie_consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            queueMicrotask(() => setVisible(true));
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true, marketing: true, necessary: true, timestamp: Date.now() }));
        setVisible(false);
        setShowSettings(false);
    };

    const acceptNecessary = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: false, marketing: false, necessary: true, timestamp: Date.now() }));
        setVisible(false);
        setShowSettings(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999]">
            <div className="bg-white border-t border-gray-200 shadow-2xl shadow-black/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    {!showSettings ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    By clicking &ldquo;Accept All Cookies&rdquo;, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.{" "}
                                    <Link href="/privacy" className="text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-2">
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                >
                                    Cookies Settings
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                                >
                                    Accept All Cookies
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-900">Cookie Preferences</h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Necessary</p>
                                        <p className="text-xs text-gray-500">Required for the site to function properly.</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Always On</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Analytics</p>
                                        <p className="text-xs text-gray-500">Helps us improve our website by collecting usage data.</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Enabled with Accept All</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Marketing</p>
                                        <p className="text-xs text-gray-500">Used to deliver relevant advertisements.</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Enabled with Accept All</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 pt-1">
                                <button
                                    onClick={acceptNecessary}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                >
                                    Only Necessary
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                                >
                                    Accept All Cookies
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
