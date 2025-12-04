'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const installed = localStorage.getItem('pwa-installed');
    
    if (!isInStandaloneMode && !dismissed && !installed) {
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no deferred prompt, show iOS instructions or generic message
      if (isIOS) {
        alert('To install YENA on iOS:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
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

  // Don't show anything if already installed
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Install Banner */}
      {showBanner && (showInstallButton || isIOS) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-[#C44536] to-[#F39C12] rounded-2xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <img 
                  src="/images/yena logo.jpeg" 
                  alt="YENA" 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Install YENA App</h3>
                <p className="text-sm text-white/90 mb-3">
                  Get quick access to opportunities, courses & more!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="btn btn-sm bg-white text-[#C44536] hover:bg-gray-100 border-none gap-1"
                  >
                    <Download size={16} />
                    Install Now
                  </button>
                  <button
                    onClick={dismissBanner}
                    className="btn btn-sm btn-ghost text-white hover:bg-white/20"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Install Button (always visible when installable) */}
      {(showInstallButton || isIOS) && !showBanner && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-50 btn bg-gradient-to-r from-[#C44536] to-[#F39C12] text-white border-none shadow-xl hover:shadow-2xl gap-2 rounded-full px-4"
          title="Install YENA App"
        >
          <Smartphone size={20} />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
