
'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
              PRIVACY POLICY
            </h1>
            <div className="w-24 h-px bg-black mx-auto"></div>
            <p className="text-gray-600 font-light">
              Last updated: September 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Information We Collect</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, subscribe to our newsletter, or contact us for support.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, send communications, and personalize your experience.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. 
                  We may share your information only as described in this privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-light text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@barrerawallpaper.com" className="text-black hover:underline">
                    privacy@barrerawallpaper.com
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
