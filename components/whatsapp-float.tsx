'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Sparkles, Percent, Phone, Palette, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from './ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { icon: ShoppingBag, label: 'Browse Catalog', path: '/catalog' },
  { icon: Percent, label: 'Get 15% OFF', path: '/register' },
  { icon: Palette, label: 'Help me choose', action: 'help' },
  { icon: Phone, label: 'Talk to Oscar', action: 'whatsapp' },
];

export default function WhatsAppFloat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadForm, setLeadForm] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasWelcomed = useRef(false);

  const whatsappNumber = "19545441740";

  // Proactive welcome — show bubble after 10s, open after 20s
  useEffect(() => {
    if (hasWelcomed.current) return;
    const timer = setTimeout(() => {
      setShowWelcome(true);
      hasWelcomed.current = true;
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const body: any = { messages: newMessages };
      if (leadForm) {
        body.lead = leadForm;
      }
      const res = await fetch('/api/ai/chat/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMessages([...newMessages, data]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = (msg?: string) => {
    const defaultMsg = msg || "Hello Oscar! I'm interested in your premium wallpaper services.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
  };

  const handleQuickAction = (action: string | undefined, path?: string) => {
    if (path) {
      window.location.href = path;
      return;
    }
    if (action === 'whatsapp') {
      openWhatsApp();
      return;
    }
    if (action === 'help') {
      sendMessage("I need help choosing the perfect wallpaper for my space. Can you guide me?");
      return;
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm?.name || !leadForm?.phone) return;
    setShowLeadForm(false);
    const msg = `Hi! I'm ${leadForm.name}. You can reach me at ${leadForm.phone}${leadForm.email ? ` or ${leadForm.email}` : ''}. I'd love to know more about your wallpaper collections.`;
    await sendMessage(msg);
  };

  const startChat = () => {
    setIsExpanded(true);
    setShowWelcome(false);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi, I'm Oscar's Assistant! 🎨 I help with:\n\n• Choosing the perfect collection for your space\n• Pricing & quotes\n• Scheduling a showroom visit\n• Getting 15% off your first order\n\nTell me about your project — is it for your home or a commercial space?"
      }]);
    }
  };

  return (
    <>
      {/* Proactive bubble */}
      <AnimatePresence>
        {showWelcome && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 max-w-[280px]"
          >
            <div className="bg-black text-white p-4 rounded-3xl rounded-br-none shadow-2xl">
              <p className="text-sm font-medium leading-relaxed">
                Need help choosing the perfect wallpaper? I'm here to help! 💫
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={startChat}
                  className="flex-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Yes, help me!
                </button>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-[10px] text-gray-400 uppercase tracking-wider px-2 hover:text-white transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] md:w-[420px] h-[600px] flex flex-col glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40"
          >
            {/* Header */}
            <div className="p-5 bg-black text-white flex items-center justify-between shadow-lg shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <Image src="/images/Barrera_logo_FAVICON-1.png" alt="Oscar Assistant" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sales Concierge</p>
                  <p className="text-sm font-bold">Oscar's Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsExpanded(false)} className="hover:rotate-90 transition-transform p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="px-4 pt-4 pb-2 bg-white/40 backdrop-blur-sm shrink-0">
              <div className="grid grid-cols-4 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.action, action.path)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white/80 hover:bg-white border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md group"
                  >
                    <action.icon className="w-4 h-4 text-gray-700 group-hover:text-black" />
                    <span className="text-[7px] font-black uppercase tracking-wide text-gray-500 group-hover:text-gray-800 text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lead capture form */}
            {showLeadForm && (
              <form onSubmit={handleLeadSubmit} className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-800 mb-2">
                  Leave your info and I'll help you personally:
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    value={leadForm?.name || ''}
                    onChange={(e) => setLeadForm(prev => ({ ...prev!, name: e.target.value }))}
                    placeholder="Your name *"
                    required
                    className="bg-white border border-yellow-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                  <input
                    value={leadForm?.phone || ''}
                    onChange={(e) => setLeadForm(prev => ({ ...prev!, phone: e.target.value }))}
                    placeholder="Phone *"
                    required
                    className="bg-white border border-yellow-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                  <input
                    value={leadForm?.email || ''}
                    onChange={(e) => setLeadForm(prev => ({ ...prev!, email: e.target.value }))}
                    placeholder="Email (optional)"
                    className="bg-white border border-yellow-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl">
                      Send
                    </Button>
                    <button type="button" onClick={() => setShowLeadForm(false)} className="text-[10px] text-gray-500 px-3">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Chat body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/30 backdrop-blur-sm custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 text-gray-400">
                  <Sparkles className="w-8 h-8 mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">Ask me anything about our premium wall coverings.</p>
                  <p className="text-xs mt-1">I can help with products, pricing, and design advice.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] p-4 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                    ? 'bg-black text-white rounded-3xl rounded-tr-none'
                    : 'bg-white/80 text-gray-800 shadow-sm border border-white/50 rounded-3xl rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 p-4 rounded-3xl shadow-sm border border-white/50 rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Lead capture prompt + Input */}
            <div className="p-4 bg-white/50 border-t border-white/20 backdrop-blur-md shrink-0">
              <div className="flex gap-2 mb-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask about products, pricing..."
                  className="flex-1 bg-white/80 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-black/5 outline-none shadow-inner"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading}
                  className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLeadForm(true)}
                  className="flex-1 h-11 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-[10px] font-bold uppercase tracking-wider gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Leave my info
                </Button>
                <Button
                  onClick={() => openWhatsApp()}
                  className="flex-1 h-11 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold gap-2 shadow-lg shadow-green-200 text-[10px] uppercase tracking-wider"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main trigger button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            startChat();
          }
        }}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isExpanded ? 'bg-black' : 'bg-white'}`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
              <MessageCircle className="w-8 h-8 text-black" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
