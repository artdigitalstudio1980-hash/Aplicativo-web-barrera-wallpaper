
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
    { name: t('about'), href: '/about/' },
    { name: t('catalog'), href: '/catalog/' },
    { name: t('design'), href: '/design/' },
    { name: t('aiStudio'), href: '/ai-studio/', isNew: true },
    { name: t('services'), href: '/services/' },
    { name: t('contact'), href: '/contact/' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/images/Barrera_logo_FAVICON-1.png"
                alt="Barrera Wallpaper Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg sm:text-2xl text-gray-900 tracking-wider hidden xs:block sm:block">
              BARRERA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 lg:space-x-12">
            {navigation?.map((item) => (
              <Link
                key={item?.name || ''}
                href={item?.href || '#'}
                className="text-gray-700 hover:text-black font-light tracking-wide transition-colors duration-200 text-xs lg:text-sm uppercase relative"
              >
                {item?.name || ''}
                {item?.isNew && (
                  <span className="absolute -top-2 -right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative px-2 sm:px-3 py-2 hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* User Menu */}
            <Link href="/account">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 py-2 hover:bg-gray-100">
                <User className="w-5 h-5 sm:mr-2" />
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
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              {navigation?.map((item) => (
                <Link
                  key={item?.name || ''}
                  href={item?.href || '#'}
                  className="text-gray-600 hover:text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm uppercase tracking-wider">{item?.name || ''}</span>
                  {item?.isNew && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
