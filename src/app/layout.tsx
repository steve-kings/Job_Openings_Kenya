import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "YENA - Youth Empowerment Network Africa",
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
    description: "Bridging the gap between young Africans and life-changing opportunities",
    images: ['/images/yena logo.jpeg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "YENA - Youth Empowerment Network Africa",
    description: "Bridging the gap between young Africans and life-changing opportunities",
    images: ['/images/yena logo.jpeg'],
  }
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
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-base-100 text-base-content`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
