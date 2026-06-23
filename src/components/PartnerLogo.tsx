'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PartnerLogoProps {
    src: string;
    alt: string;
    className?: string;
}

export default function PartnerLogo({ src, alt, className = '' }: PartnerLogoProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={150}
            height={64}
            className={className || 'h-12 md:h-16 object-contain max-w-[150px]'}
            onError={() => {
                setImgSrc('/job_openings_kenya_logo.jpeg');
            }}
        />
    );
}
