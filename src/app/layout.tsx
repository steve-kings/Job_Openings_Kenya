import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstallButton from "@/components/PWAInstallButton";
import AIChatbot from "@/components/AIChatbot";
import { getBaseUrl } from "@/lib/utils/url";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "1000Jobs - 1000Jobs",
    template: "%s | 1000Jobs"
  },
  description: "Bridging the gap between young Africans and life-changing opportunities. Access free courses, verified jobs, grants, scholarships, and training programs.",
  keywords: "1000Jobs, Youth Empowerment, Africa, Education, Jobs, Scholarships, Grants, Training, Courses",
  authors: [{ name: "1000Jobs Team" }],
  icons: {
    icon: [
      { url: '/1000jobs_logo.jpeg', sizes: 'any' },
      { url: '/1000jobs_logo.jpeg', type: 'image/jpeg' }
    ],
    apple: '/1000jobs_logo.jpeg',
  },
  openGraph: {
    title: "1000Jobs - 1000Jobs",
    description: "Bridging the gap between young Africans and life-changing opportunities. Access free courses, verified jobs, grants, scholarships, and training programs.",
    images: [
      {
        url: `${getBaseUrl()}/1000jobs_logo.jpeg`,
        width: 1200,
        height: 630,
        alt: '1000Jobs - 1000Jobs',
      }
    ],
    type: 'website',
    siteName: '1000Jobs',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "1000Jobs - 1000Jobs",
    description: "Bridging the gap between young Africans and life-changing opportunities",
    images: [`${getBaseUrl()}/1000jobs_logo.jpeg`],
    creator: '@1000jobs_africa',
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
    <html lang="en" data-theme="1000jobs">
      <head>
        <link rel="icon" href="/1000jobs_logo.jpeg" type="image/jpeg" sizes="any" />
        <link rel="shortcut icon" href="/1000jobs_logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/1000jobs_logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976D2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="1000Jobs" />
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
        <AIChatbot />
      </body>
    </html>
  );
}
