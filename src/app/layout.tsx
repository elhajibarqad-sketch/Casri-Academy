import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Casri Academy",
  title: "Casri Academy | Forex & Crypto Education",
  description: "Premium online academy for Forex, Cryptocurrency, risk management, and trading psychology.",
  keywords: ["crypto education", "forex education", "blockchain academy", "Bitcoin learning", "market analysis", "risk management"],
  authors: [{ name: "Casri Academy" }],
  creator: "Casri Academy",
  publisher: "Casri Academy",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Casri Academy",
    description: "Structured Forex and Crypto education with live market context.",
    url: "/",
    siteName: "Casri Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casri Academy",
    description: "Structured Forex and Crypto education with live market context.",
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                name: "Casri Academy",
                url: process.env.APP_URL ?? "http://localhost:3000",
                description: "Online academy for Forex, Cryptocurrency, blockchain, market literacy, and risk management education.",
                sameAs: ["https://x.com", "https://youtube.com", "https://instagram.com", "https://linkedin.com"],
              }),
            }}
          />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
