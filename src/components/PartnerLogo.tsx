'use client';

import { useState } from 'react';

interface PartnerLogoProps {
    src: string;
    alt: string;
    className?: string;
}

export default function PartnerLogo({ src, alt, className = '' }: PartnerLogoProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className || "h-12 md:h-16 object-contain max-w-[150px]"}
            onError={() => {
                setImgSrc('/images/yena logo.jpeg');
            }}
        />
    );
}
