'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Percent, ArrowRight, Gift, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  variant?: 'topbar' | 'section' | 'card' | 'inline';
}

export default function PromoBanner({ variant = 'section' }: PromoBannerProps) {
  if (variant === 'topbar') {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white">
        <Link href="/register" className="block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-10 sm:h-11 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] gap-2 sm:gap-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="hidden sm:inline">New customers —</span>
              <span>Register & get up to 10% OFF your first order</span>
              <ArrowRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Link href="/register">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-200/20 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-xl">
              <Percent className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black uppercase tracking-wider">Get 10% OFF</h4>
              <p className="text-[11px] text-gray-500 font-light">on your first wallpaper order — join now</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'inline') {
    return (
      <Link href="/register" className="group inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
        <Gift className="w-4 h-4" />
        <span>Register & get 10% OFF</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    );
  }

  return (
    <Link href="/register">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 sm:p-12 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-400/10 to-transparent rounded-bl-full" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <Percent className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                New Customer Offer
              </h3>
              <p className="text-sm text-gray-400 font-light mt-1">
                Register now and get <span className="text-yellow-400 font-bold">up to 10% off</span> your first wallpaper order
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/20 transition-colors shrink-0">
            <span className="text-white text-xs font-bold uppercase tracking-widest">Claim Offer</span>
            <ArrowRight className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
