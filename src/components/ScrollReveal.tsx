'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    variant?: 'fade' | 'slide' | 'scale' | 'blur';
    duration?: number;
}

export default function ScrollReveal({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    variant = 'slide',
    duration = 700,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const variants = {
        fade: {
            hidden: 'opacity-0',
            visible: 'opacity-100',
        },
        slide: {
            hidden: {
                up: 'translate-y-10',
                down: '-translate-y-10',
                left: 'translate-x-10',
                right: '-translate-x-10',
            }[direction],
            visible: 'translate-x-0 translate-y-0',
        },
        scale: {
            hidden: 'scale-95 opacity-0',
            visible: 'scale-100 opacity-100',
        },
        blur: {
            hidden: 'opacity-0 blur-sm',
            visible: 'opacity-100 blur-0',
        },
    };

    const v = variants[variant];
    const hidden = variant === 'slide' ? `${variants.fade.hidden} ${v.hidden}` : v.hidden;
    const shown = variant === 'slide' ? `${v.visible} ${variants.fade.visible}` : v.visible;

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible
                    ? 'translateY(0) translateX(0) scale(1)'
                    : variant === 'scale'
                        ? 'scale(0.95)'
                        : variant === 'slide'
                            ? {
                                up: 'translateY(10px)',
                                down: 'translateY(-10px)',
                                left: 'translateX(10px)',
                                right: 'translateX(-10px)',
                            }[direction]
                            : 'translateY(0)',
                filter: visible ? 'blur(0)' : variant === 'blur' ? 'blur(4px)' : 'none',
                transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
