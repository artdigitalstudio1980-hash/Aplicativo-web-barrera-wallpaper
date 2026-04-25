'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './locale-context';
import { 
  Instagram, 
  Facebook, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Footer() {
  const { t } = useLocale();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6 col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-12">
                <Image
                  src="/images/Barrera_logo_black-2.png"
                  alt="Barrera Wallpaper"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/barrerawallpaper" className="text-gray-400 hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/barrerawallpaper" className="text-gray-400 hover:text-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-light text-lg tracking-wide text-gray-900 uppercase">{t('collections')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/catalog?category=botanical" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('botanical')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=geometric" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('geometric')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=textured" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('textured')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=murals" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('murals')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-light text-lg tracking-wide text-gray-900 uppercase">{t('services')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/services" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('residentialInstallation')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('commercialSolutions2')}
                </Link>
              </li>
              <li>
                <Link href="/design" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('aiDesignStudio')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black transition-colors font-light">
                  {t('consultation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-light text-lg tracking-wide text-gray-900 uppercase">{t('contact')}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span className="font-light">Miami, Florida</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <a href="tel:+19545441740" className="font-light hover:text-black transition-colors">
                  +1 (954) 544-1740
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <a href="mailto:infobarrerawallpaper@gmail.com" className="font-light hover:text-black transition-colors">
                  infobarrerawallpaper@gmail.com
                </a>
              </div>
            </div>
            
            <div className="pt-4">
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder={t('subscribeNewsletter')}
                  className="border-gray-300 rounded-none font-light"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-none font-light tracking-wide text-sm"
                >
                  {t('subscribe')}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p className="font-light">{t('allRightsReserved')}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-black transition-colors font-light">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="hover:text-black transition-colors font-light">
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
