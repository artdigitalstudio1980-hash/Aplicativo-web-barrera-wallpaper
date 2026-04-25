
'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-wide">
              TERMS OF SERVICE
            </h1>
            <div className="w-24 h-px bg-black mx-auto"></div>
            <p className="text-gray-600 font-light">
              Last updated: September 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  By accessing and using our website and services, you accept and agree to be bound 
                  by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Use License</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  Permission is granted to temporarily download one copy of the materials on Barrera Wallpaper's 
                  website for personal, non-commercial transitory viewing only.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Disclaimer</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  The materials on Barrera Wallpaper's website are provided on an 'as is' basis. 
                  Barrera Wallpaper makes no warranties, expressed or implied.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Limitations</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  In no event shall Barrera Wallpaper or its suppliers be liable for any damages 
                  (including, without limitation, damages for loss of data or profit).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@barrerawallpaper.com" className="text-black hover:underline">
                    legal@barrerawallpaper.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
