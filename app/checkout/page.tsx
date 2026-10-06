'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/store/use-cart';
import { useLocale } from '@/components/locale-context';
import {
  ArrowLeft, ArrowRight, Truck, ShieldCheck,
  Loader2, Package, CheckCircle2, CreditCard,
  Info, ChevronRight, MapPin, Home, User, Mail, Phone, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Script from 'next/script';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { items, needsInstallation, setNeedsInstallation, getTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    installationAddress: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formErrors = (() => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Required';
    if (!form.email.trim()) errors.email = 'Required';
    if (!form.address1.trim()) errors.address1 = 'Required';
    if (!form.city.trim()) errors.city = 'Required';
    if (!form.state.trim()) errors.state = 'Required';
    if (!form.zip.trim()) errors.zip = 'Required';
    return errors;
  })();

  const canProceed = Object.keys(formErrors).length === 0;

  const subtotal = getTotal();
  const total = subtotal;

  const handleCreateOrder = async (method: 'stripe' | 'paypal') => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            wallpaperId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            measurements: item.measurements,
          })),
          shippingDetails: {
            name: form.name,
            email: form.email,
            phone: form.phone || '',
            address1: form.address1,
            address2: form.address2 || '',
            city: form.city,
            state: form.state,
            country: form.country,
            zip: form.zip,
          },
          needsInstallation,
          installationAddress: form.installationAddress,
          locale,
          paymentMethod: method,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (method === 'stripe') {
        const { approvalUrl } = data.data;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          throw new Error('No checkout URL returned');
        }
        return;
      }

      const { paypalOrderId, approvalUrl } = data.data;

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else if (window.paypal) {
        window.paypal.Buttons({
          createOrder: () => paypalOrderId,
          onApprove: async (data: any, actions: any) => {
            const captureRes = await fetch('/api/payments/paypal/capture/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paypalOrderId, orderId: data.data?.orderId, locale }),
            });
            const captureData = await captureRes.json();
            if (captureData.success) {
              clearCart();
              router.push(`/checkout/success?order=${captureData.data.orderNumber}`);
            } else {
              toast.error('Payment capture failed. Please contact support.');
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            toast.error('PayPal payment failed. Please try again.');
          },
        }).render('#paypal-button-container');
        setPaypalReady(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-4">
        <Package className="w-20 h-20 text-gray-100 mb-8" />
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6">
          {locale === 'es' ? 'Tu carrito está vacío' : 'Your Cart is Empty'}
        </h1>
        <Button onClick={() => router.push('/catalog')} className="h-14 px-10 rounded-2xl bg-black text-white hover:bg-gray-800 uppercase text-[10px] font-black tracking-widest shadow-xl">
          {locale === 'es' ? 'Volver al catálogo' : 'Back to Collections'}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white text-gray-900 selection:bg-black selection:text-white">
      <Script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Steps indicator */}
        <div className="flex items-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <span className="text-xs font-black uppercase tracking-widest">{locale === 'es' ? 'Envío' : 'Shipping'}</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <span className="text-xs font-black uppercase tracking-widest">{locale === 'es' ? 'Pago' : 'Payment'}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">

          {/* Left: Form */}
          <div className="lg:flex-1">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none mb-12">
              {step === 1
                ? (locale === 'es' ? 'Dirección' : 'Shipping')
                : (locale === 'es' ? 'Revisar y pagar' : 'Review & Pay')
              }
              <span className="text-gray-200">.</span>
            </h1>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Nombre completo' : 'Full Name'}</Label>
                      <Input
                        value={form.name}
                        onChange={e => updateForm('name', e.target.value)}
                        placeholder="John Doe"
                        className="h-14 rounded-2xl border-gray-200 text-base"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</Label>
                      <Input
                        value={form.email}
                        onChange={e => updateForm('email', e.target.value)}
                        placeholder="john@example.com"
                        type="email"
                        className="h-14 rounded-2xl border-gray-200 text-base"
                      />
                      {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Teléfono' : 'Phone'}</Label>
                    <Input
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      placeholder="+1 305 555 0123"
                      className="h-14 rounded-2xl border-gray-200 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Dirección' : 'Address'}</Label>
                    <Input
                      value={form.address1}
                      onChange={e => updateForm('address1', e.target.value)}
                      placeholder="123 Main St"
                      className="h-14 rounded-2xl border-gray-200 text-base"
                    />
                    {formErrors.address1 && <p className="text-red-500 text-xs">{formErrors.address1}</p>}
                    <Input
                      value={form.address2}
                      onChange={e => updateForm('address2', e.target.value)}
                      placeholder={locale === 'es' ? 'Apto, suite, etc. (opcional)' : 'Apt, suite, etc. (optional)'}
                      className="h-14 rounded-2xl border-gray-200 text-base mt-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Ciudad' : 'City'}</Label>
                      <Input value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="Miami" className="h-14 rounded-2xl border-gray-200" />
                      {formErrors.city && <p className="text-red-500 text-xs">{formErrors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Estado' : 'State'}</Label>
                      <select
                        value={form.state}
                        onChange={e => updateForm('state', e.target.value)}
                        className="w-full h-14 rounded-2xl border border-gray-200 bg-white px-4 text-base"
                      >
                        <option value="">--</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formErrors.state && <p className="text-red-500 text-xs">{formErrors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">ZIP</Label>
                      <Input value={form.zip} onChange={e => updateForm('zip', e.target.value)} placeholder="33101" className="h-14 rounded-2xl border-gray-200" />
                      {formErrors.zip && <p className="text-red-500 text-xs">{formErrors.zip}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'País' : 'Country'}</Label>
                      <select value={form.country} onChange={e => updateForm('country', e.target.value)} className="w-full h-14 rounded-2xl border border-gray-200 bg-white px-4 text-base">
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="MX">Mexico</option>
                      </select>
                    </div>
                  </div>

                  {/* Installation */}
                  <div className="bg-blue-50/30 border border-blue-100 p-8 rounded-[2.5rem] space-y-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="installation"
                        checked={needsInstallation}
                        onCheckedChange={(checked) => setNeedsInstallation(!!checked)}
                        className="w-6 h-6 rounded-lg border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
                      />
                      <div>
                        <label htmlFor="installation" className="text-lg font-black uppercase tracking-tighter cursor-pointer">
                          {locale === 'es' ? 'Instalación profesional' : 'Professional Installation'}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          {locale === 'es'
                            ? '¿Necesitas instalación en Miami? Te contactaremos para una cotización separada.'
                            : 'Need expert installation in Miami? We\'ll contact you for a separate quote.'}
                        </p>
                      </div>
                    </div>
                    {needsInstallation && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {locale === 'es' ? 'Dirección de instalación (si es diferente)' : 'Installation address (if different)'}
                        </Label>
                        <Input
                          value={form.installationAddress}
                          onChange={e => updateForm('installationAddress', e.target.value)}
                          placeholder={form.address1}
                          className="h-14 rounded-2xl border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceed}
                      className="h-16 px-10 rounded-2xl bg-black text-white hover:bg-gray-800 text-sm font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
                    >
                      {locale === 'es' ? 'Continuar al pago' : 'Continue to Payment'}
                      <ChevronRight className="w-5 h-5 ml-3" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  {/* Summary card */}
                  <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-[2.5rem] space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">{locale === 'es' ? 'Envío a' : 'Shipping to'}</span>
                    </div>
                    <p className="text-lg font-bold">
                      {form.name}<br />
                      {form.address1}{form.address2 ? `, ${form.address2}` : ''}<br />
                      {form.city}, {form.state} {form.zip}
                    </p>
                    <p className="text-sm text-gray-500">{form.email} · {form.phone}</p>
                    {needsInstallation && (
                      <div className="pt-4 border-t border-gray-200 mt-4 flex items-center gap-3 text-blue-600">
                        <Home className="w-5 h-5" />
                        <span className="text-sm font-bold">{locale === 'es' ? 'Instalación solicitada' : 'Installation requested'}</span>
                      </div>
                    )}
                    <button onClick={() => setStep(1)} className="text-xs text-gray-400 underline mt-4 block">
                      {locale === 'es' ? 'Editar dirección' : 'Edit address'}
                    </button>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                        <p className="text-lg font-black">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Free shipping + No tax notice */}
                  <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
                    <Truck className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      {locale === 'es'
                        ? 'Envío gratis · Sin impuestos'
                        : 'Free shipping · No tax applied'}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Total a pagar' : 'Total to Pay'}</span>
                    <span className="text-5xl font-black italic tracking-tighter">${total.toFixed(2)}</span>
                  </div>

                  {/* Payment method selector */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-6 rounded-[2rem] border-2 text-center transition-all ${
                          paymentMethod === 'stripe'
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'stripe' ? 'text-indigo-600' : 'text-gray-300'}`} />
                        <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === 'stripe' ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {locale === 'es' ? 'Tarjeta' : 'Card'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">Visa · MC · Amex</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-6 rounded-[2rem] border-2 text-center transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-600 bg-blue-50/50 shadow-md'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                          alt="PayPal" width={80} height={25}
                          className="h-7 w-auto mx-auto mb-2"
                        />
                        <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === 'paypal' ? 'text-blue-600' : 'text-gray-400'}`}>
                          PayPal
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {locale === 'es' ? 'Cuenta o tarjeta' : 'Account or card'}
                        </p>
                      </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex flex-col items-center gap-6">
                      {paymentMethod === 'paypal' && (
                        <>
                          <div id="paypal-button-container" className="w-full max-w-sm" />
                          <Button
                            onClick={() => handleCreateOrder('paypal')}
                            disabled={isProcessing}
                            className="w-full h-16 rounded-2xl bg-[#003087] hover:bg-[#002870] text-white text-sm font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-3">
                                {locale === 'es' ? 'Pagar con PayPal' : 'Pay with PayPal'}
                                <ArrowRight className="w-5 h-5" />
                              </span>
                            )}
                          </Button>
                        </>
                      )}
                      {paymentMethod === 'stripe' && (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Pago seguro con tarjeta' : 'Secure card payment'}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleCreateOrder('stripe')}
                            disabled={isProcessing}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5" />
                                {locale === 'es' ? 'Pagar con tarjeta' : 'Pay with Card'}
                                <ArrowRight className="w-5 h-5" />
                              </span>
                            )}
                          </Button>
                          <p className="text-[10px] text-gray-400">
                            {locale === 'es'
                              ? 'Serás redirigido a Stripe para pagar de forma segura'
                              : 'You\'ll be redirected to Stripe Checkout for secure payment'}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4 text-gray-300 text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-black uppercase tracking-widest">
                        {locale === 'es' ? 'Transacción segura y encriptada' : 'Encrypted & Secure Transaction'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar: order summary */}
          <div className="lg:w-[350px] shrink-0">
            <div className="sticky top-28 bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Resumen' : 'Summary'}</h3>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="truncate text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>{locale === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{locale === 'es' ? 'Envío' : 'Shipping'}</span>
                  <span>{locale === 'es' ? 'GRATIS' : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{locale === 'es' ? 'Impuestos' : 'Tax'}</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{locale === 'es' ? 'Total' : 'Total'}</span>
                <span className="text-3xl font-black italic tracking-tighter">${total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-3 pt-4 text-gray-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest">SYSTEXX Certified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
