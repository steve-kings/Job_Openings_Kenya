import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstallButton from "@/components/PWAInstallButton";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://youth-empowerment-and-networking-af.vercel.app'),
  title: {
    default: "YENA - Youth Empowerment Network Africa",
    template: "%s | YENA"
  },
  description: "Bridging the gap between young Africans and life-changing opportunities. Access free courses, verified jobs, grants, scholarships, and training programs.",
  keywords: "YENA, Youth Empowerment, Africa, Education, Jobs, Scholarships, Grants, Training, Courses",
  authors: [{ name: "YENA Team" }],
  icons: {
    icon: [
      { url: '/images/yena logo.jpeg', sizes: 'any' },
      { url: '/images/yena logo.jpeg', type: 'image/jpeg' }
    ],
    apple: '/images/yena logo.jpeg',
  },
  openGraph: {
    title: "YENA - Youth Empowerment Network Africa",
    description: "Bridging the gap between young Africans and life-changing opportunities. Access free courses, verified jobs, grants, scholarships, and training programs.",
    images: [
      {
        url: '/images/yena logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'YENA - Youth Empowerment Network Africa',
      }
    ],
    type: 'website',
    siteName: 'YENA',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "YENA - Youth Empowerment Network Africa",
    description: "Bridging the gap between young Africans and life-changing opportunities",
    images: ['/images/yena logo.jpeg'],
    creator: '@yena_africa',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="yena">
      <head>
        <link rel="icon" href="/images/yena logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/yena logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C44536" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="YENA" />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-base-100 text-base-content`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <PWAInstallButton />
      </body>
    </html>
  );
}
