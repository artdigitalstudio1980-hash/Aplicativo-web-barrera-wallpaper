'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Calendar,
  CheckCircle,
  Instagram,
  ArrowRight
} from 'lucide-react';

export default function ContactPage() {
  const { locale, t } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'consultation',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1 border border-black/10 rounded-full text-[10px] font-bold tracking-[0.4em] uppercase mb-8 bg-gray-50/50 backdrop-blur-sm">
              Connect With The Studio
            </span>
            <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-8 leading-none">
              Get In <span className="font-bold italic">Touch</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              For architectural consultations, custom design inquiries, or technical installation support in the Miami metropolitan area.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN CONTACT GRID --- */}
      <section className="pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Information Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-12">
              <div>
                <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">Direct Channels</span>
                <div className="space-y-8">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-black">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone & WhatsApp</p>
                        <a href="tel:+19545441740" className="text-xl font-bold tracking-tight hover:text-blue-600 transition-colors">+1 (954) 544-1740</a>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-black">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Inquiry</p>
                        <a href="mailto:infobarrerawallpaper@gmail.com" className="text-sm font-bold tracking-tight hover:text-blue-600 transition-colors">infobarrerawallpaper@gmail.com</a>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-black">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office Location</p>
                        <p className="text-lg font-bold tracking-tight">Miami, Florida</p>
                        <p className="text-xs text-gray-500 font-light mt-1">Metropolitan Coverage Area</p>
                      </div>
                   </div>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">Business Hours</span>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold tracking-tight">
                    <span className="text-gray-400">MON - FRI</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold tracking-tight">
                    <span className="text-gray-400">SATURDAY</span>
                    <span>9:00 AM - 3:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold tracking-tight">
                    <span className="text-gray-400">SUNDAY</span>
                    <span className="text-blue-600">BY APPOINTMENT</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <div className="flex gap-4">
                   <a href="https://instagram.com/barrerawallpaper" target="_blank" className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-black">
                      <Instagram className="w-5 h-5" />
                   </a>
                   <a href="https://wa.me/19545441740" target="_blank" className="p-4 rounded-2xl bg-green-50 border border-green-100 shadow-sm hover:shadow-md transition-all text-green-600">
                      <MessageCircle className="w-5 h-5" />
                   </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-white rounded-[3rem] border border-gray-100 shadow-3xl p-10 lg:p-16 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-8 border border-blue-100">
                    <CheckCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-4xl font-bold tracking-tighter mb-4">Request Received</h3>
                  <p className="text-gray-500 text-lg font-light mb-10 max-w-md">
                    Thank you for contacting Barrera Wallpaper. A design specialist will review your inquiry and respond within 24 hours.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="h-14 px-10 rounded-none border-black text-black font-bold uppercase text-[10px] tracking-widest"
                  >
                    SEND ANOTHER MESSAGE
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-2">Technical <span className="font-bold italic">Consultation</span></h2>
                    <p className="text-gray-400 text-sm font-light">Complete the form below for project estimations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <Input
                        required
                        className="h-14 rounded-none border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black transition-all text-base"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                      <Input
                        className="h-14 rounded-none border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black transition-all text-base"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (305) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <Input
                        type="email"
                        required
                        className="h-14 rounded-none border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black transition-all text-base"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Project Type</label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger className="h-14 rounded-none border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Residential Design</SelectItem>
                          <SelectItem value="installation">Commercial Project</SelectItem>
                          <SelectItem value="custom-order">SYSTEXX Specification</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="other">Other Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Message / Project Brief</label>
                    <Textarea
                      required
                      className="min-h-[150px] rounded-none border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black transition-all text-base resize-none"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Describe your architectural needs..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl transition-all gap-4"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>SEND INQUIRY <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              )}
            </AnimatePresence>

            {/* Decorative BG element */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* --- GOOGLE MAPS LOCATION --- */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative h-[500px] rounded-[3rem] overflow-hidden border border-gray-200 shadow-2xl bg-white"
           >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.6882672528!2d-80.1251!3d25.9338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9accf00000001%3A0x0!2zQmFycmVyYSBXYWxscGFwZXI!5e0!3m2!1sen!2sus!4v1715000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-125 opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
              ></iframe>
              
              {/* Floating Info Overlay */}
              <div className="absolute top-10 left-10 p-8 bg-white/90 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl max-w-sm hidden md:block pointer-events-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-blue-600 uppercase">Live From The Studio</span>
                </div>
                <h3 className="text-3xl font-black tracking-tighter italic mb-2">MIAMI, FLORIDA</h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
                  Our main operational center serving Sunny Isles, Palm Beach, and the Greater Miami Area.
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
                  <MapPin className="w-4 h-4" /> 
                  Primary Service Region
                </div>
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  );
}
