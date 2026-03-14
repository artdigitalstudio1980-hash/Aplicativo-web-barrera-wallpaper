import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Barrera Wallpaper - Premium Wall Coverings by Oscar Barrera",
  description: "Transform your space with premium wallpaper designs. Discover Oscar Barrera's artistic vision where design, art, and technology converge.",
  keywords: "Barrera Wallpaper, Oscar Barrera, wallpaper Miami, premium wallpaper, custom wallpaper, wall coverings, interior design",
  authors: [{ name: "Oscar Barrera" }],
  creator: "Barrera Wallpaper",
  openGraph: {
    title: "Barrera Wallpaper - Premium Wall Coverings",
    description: "Transform your space with premium wallpaper designs by Oscar Barrera",
    siteName: "Barrera Wallpaper",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barrera Wallpaper - Premium Wall Coverings",
    description: "Transform your space with premium wallpaper designs by Oscar Barrera",
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