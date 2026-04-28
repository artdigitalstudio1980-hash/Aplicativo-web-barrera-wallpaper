import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { LocaleProvider } from "@/components/locale-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsAppFloat from "@/components/whatsapp-float";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com'),
  title: {
    default: "Barrera Wallpaper - Premium Wall Coverings by Oscar Barrera",
    template: "%s | Barrera Wallpaper",
  },
  description: "Transform your space with premium wallpaper designs. Discover Oscar Barrera's artistic vision where design, art, and technology converge. AI-powered custom wallpaper, installation services in Miami & USA.",
  keywords: "Barrera Wallpaper, Oscar Barrera, wallpaper Miami, premium wallpaper, custom wallpaper, wall coverings, interior design, papel tapiz, papel tapiz Miami, AI wallpaper",
  authors: [{ name: "Oscar Barrera", url: "https://barrerawallpaper.com/about" }],
  creator: "Barrera Wallpaper",
  publisher: "Barrera Wallpaper",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Barrera Wallpaper - Premium Wall Coverings",
    description: "Transform your space with premium wallpaper designs by Oscar Barrera. AI-powered custom designs, professional installation.",
    siteName: "Barrera Wallpaper",
    locale: "en_US",
    alternateLocale: "es_US",
    type: "website",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Barrera Wallpaper - Premium Wall Coverings',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barrera Wallpaper - Premium Wall Coverings",
    description: "Transform your space with premium wallpaper designs by Oscar Barrera",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-white">
        <Providers>
          <LocaleProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <WhatsAppFloat />
            </div>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}