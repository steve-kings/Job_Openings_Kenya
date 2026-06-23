'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');
  });

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const installed = localStorage.getItem('pwa-installed');

    if (!isStandalone && !dismissed && !installed) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        alert('To install Job Openings Kenya on iOS:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Install Banner */}
      {showBanner && (showInstallButton || isIOS) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] rounded-2xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Image src="/job_openings_kenya_logo.jpeg" alt="Job Openings Kenya" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Install Job Openings Kenya App</h3>
                <p className="text-sm text-white/90 mb-3">
                  Get instant access to the latest job openings in Kenya!
                </p>
                <div className="flex gap-2">
                  <button onClick={handleInstallClick} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#5CB800] hover:bg-gray-100 font-semibold text-sm transition-colors">
                    <Download size={16} />
                    Install Now
                  </button>
                  <button onClick={dismissBanner} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
                    Later
                  </button>
                </div>
              </div>
              <button onClick={dismissBanner} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Install Button */}
      {(showInstallButton || isIOS) && !showBanner && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-50 inline-flex items-center justify-center bg-[#5CB800] text-white shadow-xl hover:bg-[#4A9900] gap-2 rounded-full px-4 py-2"
          title="Install Job Openings Kenya App"
        >
          <Smartphone size={20} />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
      `}</style>
    </>
  );
}
