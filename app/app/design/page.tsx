'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Wand2, ArrowRight, Loader2, CheckCircle,
  RefreshCcw, ChevronLeft, Brush, Eraser, ZoomIn, ZoomOut,
  Sliders, ImagePlus, Sparkles, Eye, Download, Split, Ruler
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';
import { Send } from 'lucide-react';

const STEPS = ['Upload Space', 'Paint Walls', 'Visualize', 'Result'];

function DesignVisualizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWallpaperId = searchParams.get('wallpaperId');
  const { locale } = useLocale();

  const [step, setStep] = useState(0);
  const [roomImageSrc, setRoomImageSrc] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<any | null>(null);
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // IA Assistant States
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: 'assistant', content: "Hi! I'm your Design Consultant. Upload a photo of your room to start transforming it." }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const roomImageRef = useRef<HTMLImageElement | null>(null);

  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(40);

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const msg = aiInput.trim();
    setAiInput('');
    const newMsgs = [...aiMessages, { role: 'user', content: msg }];
    setAiMessages(newMsgs);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMsgs,
          currentStep: STEPS[step],
          selectedProduct: selectedWallpaper?.name
        }),
      });
      const data = await res.json();
      setAiMessages([...newMsgs, data]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => { fetchWallpapers(); }, []);

  const fetchWallpapers = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setWallpapers(data.products);
        if (preselectedWallpaperId) {
          const wp = data.products.find((p: any) => p.id === preselectedWallpaperId);
          if (wp) setSelectedWallpaper(wp);
        }
      }
    } catch (e) {
      console.error('fetchWallpapers error:', e);
    }
  };

  const loadImageToCanvas = useCallback((src: string) => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const img = new window.Image();
    img.onload = () => {
      roomImageRef.current = img;
      const maxW = canvas.parentElement?.clientWidth || 800;
      const scale = Math.min(maxW / img.width, 500 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      overlay.width = canvas.width;
      overlay.height = canvas.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      const octx = overlay.getContext('2d');
      if (octx) {
        octx.clearRect(0, 0, overlay.width, overlay.height);
      }
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (step === 1 && roomImageSrc) {
      setTimeout(() => loadImageToCanvas(roomImageSrc), 100);
    }
  }, [step, roomImageSrc, loadImageToCanvas]);

  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRoomImageSrc(reader.result as string);
      setStep(1);
    };
    reader.readAsDataURL(file);
  };

  const getCanvasPos = (e: any) => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const canvas = overlayRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getCanvasPos(e);

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Color de la máscara
    ctx.fill();
  };

  const handleGenerate = async () => {
    if (!roomImageSrc || !selectedWallpaper) {
      toast.error('Selecciona un diseño primero');
      return;
    }
    setIsGenerating(true);
    setStep(2);
    
    // Simulación de carga IA (para el prototipo visual rápido)
    setTimeout(() => {
      setGeneratedImage(roomImageSrc); // Aquí iría la llamada real a Replicate
      setStep(3);
      setIsGenerating(false);
      toast.success('¡Diseño aplicado con éxito!');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-premium pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Superior */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-1.5 text-xs font-bold mb-4 tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              Simulador IA Premium
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter">
              VISUALIZA TU <span className="text-gray-400 italic">NUEVA PARED</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Sube una foto de tu hogar, oficina o bodega y deja que nuestra IA haga la magia.
            </p>
          </motion.div>
        </div>

        {/* Pasos Progress */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-xl">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-500 ${step === i ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>
                  {i + 1}. {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PASO 0: CARGA */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="glass-card rounded-[3rem] p-20 text-center border-dashed border-2 border-gray-200 cursor-pointer group hover:border-black transition-all"
              >
                <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">Sube la foto de tu espacio</h3>
                <p className="text-gray-400 text-lg mb-8">Casa, Apartamento, Bodega o Local Comercial</p>
                <Button className="rounded-full px-12 h-14 text-lg font-bold bg-black hover:bg-gray-800 shadow-xl">
                  Seleccionar Imagen
                </Button>
                <input type="file" ref={fileInputRef} hidden onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>
            </motion.div>
          )}

          {/* PASO 1: PINTAR PAREDES */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card rounded-3xl p-6">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <Sliders className="w-4 h-4" /> Herramientas
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button onClick={() => setTool('brush')} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${tool === 'brush' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                      <Brush className="w-5 h-5" /> <span className="text-[10px] font-bold">PINCEL</span>
                    </button>
                    <button onClick={() => setTool('eraser')} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${tool === 'eraser' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                      <Eraser className="w-5 h-5" /> <span className="text-[10px] font-bold">BORRAR</span>
                    </button>
                  </div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Tamaño: {brushSize}px</label>
                  <input type="range" min={10} max={120} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-black mb-8" />
                  
                  <Button variant="outline" className="w-full rounded-xl border-gray-200" onClick={() => setStep(0)}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Cambiar Foto
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="glass rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden">
                  <div className="relative inline-block cursor-crosshair select-none w-full">
                    <canvas ref={canvasRef} className="block rounded-3xl w-full h-auto" />
                    <canvas
                      ref={overlayRef}
                      className="absolute top-0 left-0 rounded-3xl w-full h-auto"
                      onMouseDown={(e) => { isDrawing.current = true; draw(e); }}
                      onMouseMove={(e) => { if (isDrawing.current) draw(e); }}
                      onMouseUp={() => { isDrawing.current = false; }}
                      onMouseLeave={() => { isDrawing.current = false; }}
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button onClick={() => setStep(2)} className="h-14 px-12 bg-black hover:bg-gray-800 text-white rounded-full font-bold shadow-2xl tracking-widest uppercase text-xs">
                    Siguiente: Escoger Textura <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 2: ELEGIR WALLPAPER */}
          {step === 2 && !isGenerating && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
              <div className="glass-card rounded-[3rem] p-10">
                <h2 className="text-2xl font-bold mb-8 tracking-tight">Selecciona la textura deseada</h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 mb-10 overflow-y-auto max-h-[400px] p-2">
                  {wallpapers.map((wp) => {
                    const imgUrl = wp.imageUrl || (Array.isArray(wp.images) ? wp.images[0] : '') || '';
                    const isSelected = selectedWallpaper?.id === wp.id;
                    return (
                      <button
                        key={wp.id}
                        onClick={() => setSelectedWallpaper(wp)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${isSelected ? 'border-black scale-105 shadow-2xl' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-95'}`}
                      >
                        <Image src={imgUrl} alt={wp.name} fill className="object-cover" unoptimized />
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between p-6 bg-black/5 rounded-3xl">
                  <div className="flex items-center gap-4">
                    {selectedWallpaper && (
                      <>
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                          <Image src={selectedWallpaper.imageUrl || selectedWallpaper.images?.[0]} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{selectedWallpaper.nameEs || selectedWallpaper.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-widest">{selectedWallpaper.sku}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!selectedWallpaper}
                    className="h-14 px-12 bg-black hover:bg-gray-800 text-white rounded-full font-bold shadow-2xl uppercase tracking-widest text-xs"
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Aplicar Diseño
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* GENERANDO IA */}
          {step === 2 && isGenerating && (
            <motion.div key="gen" className="text-center py-40">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-black mb-8" />
              <h2 className="text-3xl font-black mb-4">LA IA ESTÁ TRABAJANDO...</h2>
              <p className="text-gray-400">Analizando paredes y aplicando texturas en alta definición.</p>
            </motion.div>
          )}

          {/* PASO 3: RESULTADO FINAL */}
          {step === 3 && generatedImage && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto">
              <div className="glass-card rounded-[3.5rem] overflow-hidden shadow-2xl">
                <div className="relative aspect-video">
                  <Image src={generatedImage} alt="Resultado IA" fill className="object-cover" unoptimized />
                </div>
                <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
                  <div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight">¡Resultado Listo!</h3>
                    <p className="text-gray-400 font-medium">Diseño: {selectedWallpaper?.nameEs || selectedWallpaper?.name}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="rounded-full h-14 px-8" onClick={() => setStep(2)}>
                      Probar Otro
                    </Button>
                    <Button 
                      className="rounded-full h-14 px-12 bg-black text-white font-black shadow-2xl hover:bg-gray-800 uppercase tracking-widest text-xs"
                      onClick={() => router.push(`/calculator?wallpaperId=${selectedWallpaper?.id}`)}
                    >
                      <Ruler className="w-4 h-4 mr-2" /> Ir a la Calculadora
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- AI DESIGN ASSISTANT BUBBLE --- */}
        <div className="fixed bottom-10 left-10 z-[60]">
          <AnimatePresence>
            {isAssistantOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-20 left-0 w-[320px] h-[400px] flex flex-col bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden"
              >
                <div className="p-6 bg-black text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Design Expert</span>
                  </div>
                  <button onClick={() => setIsAssistantOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />}
                </div>

                <div className="p-3 bg-gray-50 flex gap-2">
                  <input 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask for design advice..."
                    className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-[10px] outline-none"
                  />
                  <button onClick={handleAiSend} className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            {isAssistantOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-premium"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>}>
      <DesignVisualizerContent />
    </Suspense>
  );
}
