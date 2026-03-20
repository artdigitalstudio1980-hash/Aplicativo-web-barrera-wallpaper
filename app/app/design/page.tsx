'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Wand2, ArrowRight, Loader2, CheckCircle,
  RefreshCcw, ChevronLeft, Brush, Eraser, ZoomIn, ZoomOut,
  Sliders, ImagePlus, Sparkles, Eye, Download, Split
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';

const STEPS = ['Upload Room', 'Paint Walls', 'Choose & Visualize', 'Result'];

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const roomImageRef = useRef<HTMLImageElement | null>(null);

  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(40);

  useEffect(() => { fetchWallpapers(); }, []);

  const fetchWallpapers = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setWallpapers(data.products.slice(0, 20));
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
      toast.error('Image must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRoomImageSrc(reader.result as string);
      setStep(1);
    };
    reader.readAsDataURL(file);
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = overlayRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getCanvasPos(e);

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(147, 51, 234, 0.45)';
    ctx.fill();
  };

  const extractMask = (): string => {
    const overlay = overlayRef.current!;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = overlay.width;
    maskCanvas.height = overlay.height;
    const mctx = maskCanvas.getContext('2d')!;
    mctx.fillStyle = 'black';
    mctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    const overlayData = overlay.getContext('2d')!.getImageData(0, 0, overlay.width, overlay.height);
    const maskData = mctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    for (let i = 0; i < overlayData.data.length; i += 4) {
      if (overlayData.data[i + 3] > 20) {
        maskData.data[i] = 255;
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 255;
        maskData.data[i + 3] = 255;
      }
    }
    mctx.putImageData(maskData, 0, 0);
    return maskCanvas.toDataURL('image/png');
  };

  const hasMask = (): boolean => {
    const overlay = overlayRef.current;
    if (!overlay) return false;
    const data = overlay.getContext('2d')!.getImageData(0, 0, overlay.width, overlay.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 20) return true;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!roomImageSrc || !selectedWallpaper) {
      toast.error('Please select a wallpaper first');
      return;
    }
    const mask = hasMask() ? extractMask() : null;
    setIsGenerating(true);
    setStep(2);
    try {
      const res = await fetch('/api/ai/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomImage: roomImageSrc,
          maskImage: mask,
          wallpaperId: selectedWallpaper.id,
          wallpaperName: selectedWallpaper.name,
          wallpaperImageUrl: selectedWallpaper.imageUrl || (Array.isArray(selectedWallpaper.images) ? selectedWallpaper.images[0] : null),
        }),
      });

      const data = await res.json();

      if (data.predictionId) {
        setPredictionId(data.predictionId);
        pollPrediction(data.predictionId);
      } else if (data.success && data.generatedImage) {
        setGeneratedImage(data.generatedImage);
        setStep(3);
        setIsGenerating(false);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Visualization failed. Using preview mode.');
      setGeneratedImage(roomImageSrc);
      setStep(3);
      setIsGenerating(false);
    }
  };

  const pollPrediction = async (id: string) => {
    const maxAttempts = 40;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/ai/visualize/status/${id}`);
        const data = await res.json();
        if (data.status === 'succeeded' && data.output) {
          clearInterval(interval);
          setGeneratedImage(data.output);
          setStep(3);
          setIsGenerating(false);
          toast.success('Visualization ready!');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          toast.error('AI processing failed. Showing preview.');
          setGeneratedImage(selectedWallpaper?.imageUrl || roomImageSrc);
          setStep(3);
          setIsGenerating(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.error('Timeout. Showing fallback preview.');
          setGeneratedImage(selectedWallpaper?.imageUrl || roomImageSrc);
          setStep(3);
          setIsGenerating(false);
        }
      } catch (e) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setGeneratedImage(roomImageSrc);
          setStep(3);
          setIsGenerating(false);
        }
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {locale === 'es' ? 'Simulador Visual con IA' : 'AI-Powered Room Visualizer'}
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-3">
              {locale === 'es' ? 'DISEÑA TU ESPACIO' : 'DESIGN YOUR SPACE'}
            </h1>
            <div className="w-20 h-px bg-black mx-auto mb-4" />
            <p className="text-gray-500 max-w-2xl mx-auto text-base">
              {locale === 'es'
                ? 'Sube una foto, pinta las paredes que deseas tapizar y aplica cualquier diseño de nuestro catálogo con IA.'
                : 'Upload a photo, paint the walls you want to cover, then apply any wallpaper from our catalog using AI.'}
            </p>
          </motion.div>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  step === i ? 'bg-black text-white shadow-lg' :
                  step > i ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-current text-xs">{i + 1}</span>}
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 rounded-full ${step > i ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <AnimatePresence mode="wait">

          {/* STEP 0: Upload */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? 'border-purple-400 bg-purple-50 scale-[1.01]' : 'border-gray-300 bg-white hover:border-gray-500 hover:bg-gray-50'
                }`}
              >
                <UploadCloud className={`w-20 h-20 mx-auto mb-6 transition-colors ${isDragging ? 'text-purple-500' : 'text-gray-300 group-hover:text-gray-500'}`} />
                <h3 className="text-2xl font-light mb-2 text-gray-800">
                  {locale === 'es' ? 'Arrastra o sube tu foto' : 'Drag & drop or click to upload'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {locale === 'es' ? 'JPG, PNG — hasta 10MB. Funciona mejor con fotos bien iluminadas.' : 'JPG, PNG — up to 10MB. Works best with well-lit photos.'}
                </p>
                <Button variant="outline" className="rounded-full px-10 border-gray-300 hover:border-black pointer-events-none">
                  <ImagePlus className="w-4 h-4 mr-2" />
                  {locale === 'es' ? 'Seleccionar archivo' : 'Select file'}
                </Button>
                <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>

              {/* Examples row */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{locale === 'es' ? 'Tipos de espacios soportados' : 'Supported space types'}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Living Room', 'Bedroom', 'Office', 'Hotel Lobby', 'Restaurant', 'Bathroom', 'Hallway'].map(s => (
                    <span key={s} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Paint Walls */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Tools panel */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      {locale === 'es' ? 'Herramientas' : 'Tools'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <button onClick={() => setTool('brush')} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${tool === 'brush' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <Brush className="w-5 h-5" /> {locale === 'es' ? 'Pincel' : 'Brush'}
                      </button>
                      <button onClick={() => setTool('eraser')} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${tool === 'eraser' ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <Eraser className="w-5 h-5" /> {locale === 'es' ? 'Borrar' : 'Eraser'}
                      </button>
                    </div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {locale === 'es' ? 'Tamaño del pincel' : 'Brush Size'}: {brushSize}px
                    </label>
                    <input type="range" min={10} max={120} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full mt-2 accent-purple-600" />

                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => {
                          const ctx = overlayRef.current?.getContext('2d');
                          if (ctx && overlayRef.current) ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                        }}
                        className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        {locale === 'es' ? 'Limpiar selección' : 'Clear Selection'}
                      </button>
                      <button
                        onClick={() => setStep(0)}
                        className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> {locale === 'es' ? 'Cambiar foto' : 'Change Photo'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
                    <p className="font-medium mb-1">💡 {locale === 'es' ? 'Consejo' : 'Tip'}</p>
                    <p>{locale === 'es' ? 'Pinta sobre las paredes donde quieres aplicar el wallpaper. Puedes saltarte este paso.' : 'Paint over the walls where you want wallpaper applied. You can skip this step too.'}</p>
                  </div>
                </div>

                {/* Canvas area */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">
                        {locale === 'es' ? 'Pinta las paredes (púrpura = área a tapizar)' : 'Paint the walls (purple = area to wallpaper)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400 opacity-60" />
                        <span className="text-xs text-gray-400">{locale === 'es' ? 'Zona pintada' : 'Painted zone'}</span>
                      </div>
                    </div>
                    <div className="relative flex justify-center p-4 bg-gray-50" style={{ minHeight: 400 }}>
                      <div className="relative inline-block cursor-crosshair select-none">
                        <canvas ref={canvasRef} className="block rounded-lg shadow" />
                        <canvas
                          ref={overlayRef}
                          className="absolute top-0 left-0 rounded-lg"
                          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                          onMouseDown={(e) => { isDrawing.current = true; draw(e); }}
                          onMouseMove={(e) => { if (isDrawing.current) draw(e); }}
                          onMouseUp={() => { isDrawing.current = false; }}
                          onMouseLeave={() => { isDrawing.current = false; }}
                          onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; draw(e); }}
                          onTouchMove={(e) => { e.preventDefault(); if (isDrawing.current) draw(e); }}
                          onTouchEnd={() => { isDrawing.current = false; }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      className="h-12 px-8 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg"
                    >
                      {locale === 'es' ? 'Continuar: Elegir wallpaper' : 'Continue: Choose Wallpaper'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Select Wallpaper + Generate */}
          {step === 2 && !isGenerating && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Room preview */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">{locale === 'es' ? 'Tu habitación' : 'Your Room'}</h3>
                    </div>
                    <div className="relative aspect-video">
                      {roomImageSrc && <Image src={roomImageSrc} alt="Room" fill className="object-cover" />}
                    </div>
                    <div className="p-3">
                      <button onClick={() => setStep(1)} className="w-full text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
                        <ChevronLeft className="w-3 h-3" /> {locale === 'es' ? 'Volver a pintar paredes' : 'Back to paint walls'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wallpaper selection */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900">
                        {locale === 'es' ? 'Selecciona un wallpaper del catálogo' : 'Select a wallpaper from catalog'}
                      </h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {locale === 'es' ? `${wallpapers.length} diseños disponibles` : `${wallpapers.length} designs available`}
                      </p>
                    </div>

                    <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
                      {wallpapers.length > 0 ? wallpapers.map((wp) => {
                        const imgUrl = wp.imageUrl || (Array.isArray(wp.images) ? wp.images[0] : '') || '';
                        const isSelected = selectedWallpaper?.id === wp.id;
                        return (
                          <button
                            key={wp.id}
                            onClick={() => setSelectedWallpaper(wp)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${isSelected ? 'border-black scale-95 shadow-lg ring-2 ring-black ring-offset-1' : 'border-transparent hover:border-gray-300 hover:scale-95'}`}
                          >
                            {imgUrl ? (
                              <Image src={imgUrl} alt={wp.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-400">{wp.name?.slice(0, 8)}</span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <CheckCircle className="text-white w-7 h-7 drop-shadow" />
                              </div>
                            )}
                          </button>
                        );
                      }) : (
                        <div className="col-span-4 flex items-center justify-center py-16 text-gray-400">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">{locale === 'es' ? 'Cargando catálogo...' : 'Loading catalog...'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                      {selectedWallpaper && (
                        <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {(selectedWallpaper.imageUrl || selectedWallpaper.images?.[0]) && (
                              <Image src={selectedWallpaper.imageUrl || selectedWallpaper.images[0]} alt="" fill className="object-cover" unoptimized />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedWallpaper.name}</p>
                            <p className="text-xs text-gray-400">${selectedWallpaper.price?.toFixed(2) || '--'}/sqft</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                        </div>
                      )}
                      <Button
                        onClick={handleGenerate}
                        disabled={!selectedWallpaper}
                        className="w-full h-13 py-3.5 text-base font-light tracking-wide rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-200 disabled:opacity-50"
                      >
                        <Wand2 className="w-5 h-5 mr-2" />
                        {locale === 'es' ? 'Aplicar con IA' : 'Apply with AI'}
                        <Sparkles className="w-4 h-4 ml-2 opacity-75" />
                      </Button>
                      <p className="text-xs text-center text-gray-400 mt-2">
                        {locale === 'es' ? '*La IA tarda entre 15 y 45 segundos.' : '*AI processing takes 15–45 seconds.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* GENERATING STATE */}
          {step === 2 && isGenerating && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-10 h-10 text-purple-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-light text-gray-800 mb-1">
                  {locale === 'es' ? 'La IA está aplicando el wallpaper...' : 'AI is applying the wallpaper...'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {locale === 'es' ? 'Segmentando paredes y aplicando el diseño. Por favor espera.' : 'Segmenting walls and applying design. Please wait.'}
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Result */}
          {step === 3 && generatedImage && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">

              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">
                      {locale === 'es' ? '¡Visualización generada!' : 'Visualization Ready!'}
                    </span>
                    {selectedWallpaper && (
                      <span className="text-sm text-gray-400">— {selectedWallpaper.name}</span>
                    )}
                  </div>
                  <button onClick={() => setShowComparison(!showComparison)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition">
                    <Split className="w-4 h-4" />
                    {showComparison ? (locale === 'es' ? 'Ocultar original' : 'Hide original') : (locale === 'es' ? 'Comparar' : 'Compare')}
                  </button>
                </div>

                <div className={`grid ${showComparison ? 'grid-cols-2' : 'grid-cols-1'} gap-0`}>
                  {showComparison && (
                    <div className="relative aspect-video border-r border-gray-200">
                      {roomImageSrc && <Image src={roomImageSrc} alt="Original" fill className="object-cover" />}
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {locale === 'es' ? 'Original' : 'Before'}
                      </div>
                    </div>
                  )}
                  <div className="relative aspect-video">
                    <Image src={generatedImage} alt="AI Result" fill className="object-cover" unoptimized />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {locale === 'es' ? 'Con wallpaper' : 'With Wallpaper'}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-wrap gap-3 justify-between items-center border-t border-gray-100">
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" className="rounded-xl" onClick={() => { setGeneratedImage(null); setStep(2); setIsGenerating(false); }}>
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      {locale === 'es' ? 'Probar otro diseño' : 'Try Another Design'}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => { setStep(1); setGeneratedImage(null); }}>
                      <Brush className="w-4 h-4 mr-2" />
                      {locale === 'es' ? 'Repintar paredes' : 'Repaint Walls'}
                    </Button>
                    <a href={generatedImage} download="barrera-wallpaper-visualization.jpg">
                      <Button variant="outline" className="rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        {locale === 'es' ? 'Descargar' : 'Download'}
                      </Button>
                    </a>
                  </div>
                  <Button
                    size="lg"
                    className="rounded-xl bg-black hover:bg-gray-800 text-white px-8 shadow-xl"
                    onClick={() => router.push(`/calculator?wallpaperId=${selectedWallpaper?.id}`)}
                  >
                    {locale === 'es' ? 'Cotizar ahora' : 'Get a Quote'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Wallpaper Info Card */}
              {selectedWallpaper && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: locale === 'es' ? 'Diseño seleccionado' : 'Selected Design', value: selectedWallpaper.name },
                    { label: locale === 'es' ? 'Precio base' : 'Base Price', value: `$${selectedWallpaper.price?.toFixed(2) || '--'}/sqft` },
                    { label: locale === 'es' ? 'Material' : 'Material', value: selectedWallpaper.material || 'Premium Vinyl' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="font-medium text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <DesignVisualizerContent />
    </Suspense>
  );
}
