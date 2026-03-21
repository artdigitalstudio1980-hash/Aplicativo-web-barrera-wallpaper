'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from './ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WhatsAppFloat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to Barrera Wallpaper. I am Oscar's digital concierge. How can I help you transform your space in Miami today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = "19545441740";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, data]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    const defaultMsg = "Hello Oscar! I'm interested in your premium wallpaper services. I was just chatting with your AI assistant.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
  };

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            className="fixed bottom-24 right-4 z-50 w-[350px] md:w-[400px] h-[500px] flex flex-col glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40"
          >
            {/* Header */}
            <div className="p-6 bg-black text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <Image src="/images/Barrera_logo_FAVICON-1.png" alt="Oscar Assistant" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Concierge</p>
                  <p className="text-sm font-bold">Oscar's Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsExpanded(false)} className="hover:rotate-90 transition-transform">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/30 backdrop-blur-sm custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                    m.role === 'user' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white/80 text-gray-800 shadow-sm border border-white/50 rounded-tl-none'
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

            {/* Actions / Input */}
            <div className="p-4 bg-white/50 border-t border-white/20 backdrop-blur-md">
              <div className="flex gap-2 mb-3">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/80 border-none rounded-full px-5 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <Button 
                onClick={openWhatsApp}
                className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold gap-2 shadow-lg shadow-green-200 uppercase text-[10px] tracking-widest"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to Oscar on WhatsApp
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
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
