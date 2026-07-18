'use client';
import { useEffect } from 'react';
import { ADSENSE_CLIENT_ID } from '@/lib/adsense';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
}

export default function GoogleAd({ adSlot, adFormat = 'auto', fullWidthResponsive = true }: GoogleAdProps) {
  const clientId = ADSENSE_CLIENT_ID;
  const hasValidClient = /^ca-pub-\d+$/.test(clientId);
  const hasValidSlot = /^\d+$/.test(adSlot.trim());
  const isConfigured = hasValidClient && hasValidSlot;

  useEffect(() => {
    if (isConfigured) {
      try {
        // @ts-expect-error AdSense not in window type
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('Google AdSense error', err);
      }
    }
  }, [isConfigured]);

  // Never send placeholder or malformed ad-unit IDs to AdSense. Auto Ads can
  // still run from the global loader while manual units wait for a real slot.
  if (!isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="w-full bg-gray-100 border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 rounded-lg my-4">
          Google Ad Unit Placeholder<br/>
          <span className="text-xs mt-2 block">Configure a numeric AdSense slot ID before enabling this manual unit.</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full overflow-hidden flex justify-center py-4 my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
