import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstallButton from "@/components/PWAInstallButton";
import AIChatbot from "@/components/AIChatbot";
import { getBaseUrl } from "@/lib/utils/url";
import { BookmarkProvider } from "@/contexts/BookmarkContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Job Openings Kenya - Your Portal for the latest Job Openings in Kenya",
    template: "%s | Job Openings Kenya"
  },
  description: "Your Portal for the latest Job Openings in Kenya. Find verified jobs, grants, scholarships, and training programs updated daily.",
  keywords: "Job Openings Kenya, Jobs in Kenya, Kenya Jobs 2025, Kenyan Jobs Portal, Scholarships Kenya, Grants Kenya, Training Kenya",
  authors: [{ name: "Job Openings Kenya Team" }],
  icons: {
    icon: [
      { url: '/job_openings_kenya_logo.jpeg', sizes: 'any' },
      { url: '/job_openings_kenya_logo.jpeg', type: 'image/jpeg' }
    ],
    apple: '/job_openings_kenya_logo.jpeg',
  },
  openGraph: {
    title: "Job Openings Kenya - Your Portal for the latest Job Openings in Kenya",
    description: "Your Portal for the latest Job Openings in Kenya. Find verified jobs, grants, scholarships, and training programs updated daily.",
    images: [
      {
        url: `${getBaseUrl()}/job_openings_kenya_logo.jpeg`,
        width: 1200,
        height: 630,
        alt: 'Job Openings Kenya',
      }
    ],
    type: 'website',
    siteName: 'Job Openings Kenya',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Job Openings Kenya - Your Portal for the latest Job Openings in Kenya",
    description: "Your Portal for the latest Job Openings in Kenya",
    images: [`${getBaseUrl()}/job_openings_kenya_logo.jpeg`],
    creator: '@JobOpeningsKE',
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
    <html lang="en" data-theme="jobopeningskenya">
      <head>
        <link rel="icon" href="/job_openings_kenya_logo.jpeg" type="image/jpeg" sizes="any" />
        <link rel="shortcut icon" href="/job_openings_kenya_logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/job_openings_kenya_logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5CB800" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Job Openings Kenya" />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-base-100 text-base-content`}
      >
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-7NYYNT14WQ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7NYYNT14WQ');
            `,
          }}
        />

        <BookmarkProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <PWAInstallButton />
          <AIChatbot />
        </BookmarkProvider>
      </body>
    </html>
  );
}
