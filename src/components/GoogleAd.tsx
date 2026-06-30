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

  useEffect(() => {
    if (clientId) {
      try {
        // @ts-expect-error AdSense not in window type
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('Google AdSense error', err);
      }
    }
  }, [clientId]);

  if (!clientId) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="w-full bg-gray-100 border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 rounded-lg my-4">
          Google Ad Banner Placeholder<br/>
          <span className="text-xs mt-2 block">(Configure NEXT_PUBLIC_ADSENSE_CLIENT_ID in .env.local to see live ads)</span>
        </div>
      );
    }
    return null; // Fail silently in production if no ID is set
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
