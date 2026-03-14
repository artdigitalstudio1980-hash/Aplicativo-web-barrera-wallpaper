
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './locale-context';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Globe
} from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('catalog'), href: '/catalog' },
    { name: t('design'), href: '/design' },
    { name: t('aiStudio'), href: '/ai-studio', isNew: true },
    { name: t('services'), href: '/services' },
    { name: t('contact'), href: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src="/images/Barrera_logo_FAVICON-1.png"
                alt="Barrera Wallpaper Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-wider hidden sm:block">
              BARRERAWALLPAPER
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-12">
            {navigation?.map((item) => (
              <Link
                key={item?.name || ''}
                href={item?.href || '#'}
                className="text-gray-700 hover:text-black font-light tracking-wide transition-colors duration-200 text-sm uppercase relative"
              >
                {item?.name || ''}
                {item?.isNew && (
                  <span className="absolute -top-2 -right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Temporarily hidden, English-only version */}
            {/* <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-3 py-2 hover:bg-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Language button clicked, current locale:', locale);
                  const newLocale = locale === 'en' ? 'es' : 'en';
                  console.log('Switching to:', newLocale);
                  setLocale(newLocale);
                }}
                title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
              >
                <Globe className="w-4 h-4 mr-1" />
                <span className="text-sm font-light uppercase tracking-wide">
                  {locale === 'en' ? 'EN' : 'ES'}
                </span>
              </Button>
            </div> */}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative px-3 py-2 hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* User Menu */}
            <Link href="/account">
              <Button variant="ghost" size="sm" className="px-3 py-2 hover:bg-gray-100">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:block font-light tracking-wide text-sm uppercase">{t('account')}</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden px-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation?.map((item) => (
                <Link
                  key={item?.name || ''}
                  href={item?.href || '#'}
                  className="text-gray-600 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item?.name || ''}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
