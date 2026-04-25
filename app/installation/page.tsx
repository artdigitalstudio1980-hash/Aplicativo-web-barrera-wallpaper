'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocale } from '@/components/locale-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Home,
  Building,
  Clock,
  MapPin,
  Phone,
  Mail,
  Ruler,
  Loader2
} from 'lucide-react';

export default function InstallationPage() {
  const { t, locale } = useLocale();
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>();
  const [alternativeDate, setAlternativeDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const [form, setForm] = useState({
    contactName: session?.user?.name || '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    type: 'RESIDENTIAL',
    wallpaperType: '',
    wallArea: '',
    rooms: '1',
    specialRequests: '',
  });

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        userId: (session?.user as any)?.id || null,
        rooms: [{ count: parseInt(form.rooms), description: form.wallpaperType }],
        preferredDate: preferredDate?.toISOString() || null,
        alternativeDate: alternativeDate?.toISOString() || null,
      };

      const res = await fetch('/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      setSubmissionId(data.id);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateLocale = locale === 'es' ? es : undefined;

  const disabledDays = (date: Date) => {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || day === 0;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <Card className="shadow-xl">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {locale === 'es' ? '¡Solicitud Enviada!' : 'Request Submitted!'}
              </h2>
              <p className="text-gray-600 mb-4">
                {locale === 'es'
                  ? 'Hemos recibido tu solicitud de instalación. Nuestro equipo te contactará en las próximas 24 horas para confirmar la fecha.'
                  : 'We received your installation request. Our team will contact you within 24 hours to confirm the date.'}
              </p>
              {submissionId && (
                <Badge variant="outline" className="text-sm mb-6">
                  {locale === 'es' ? 'Referencia' : 'Reference'}: #{submissionId.slice(-8).toUpperCase()}
                </Badge>
              )}
              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push('/')}>
                  {locale === 'es' ? 'Volver al Inicio' : 'Back to Home'}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/catalog')}>
                  {locale === 'es' ? 'Ver Catálogo' : 'View Catalog'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-gray-400 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
            {locale === 'es' ? 'Servicio Premium' : 'Premium Service'}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {locale === 'es' ? 'Agenda tu Instalación' : 'Schedule Your Installation'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Nuestros instaladores certificados transformarán tu espacio con precisión y cuidado.'
              : 'Our certified installers will transform your space with precision and care.'}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { icon: Clock, label: locale === 'es' ? 'Respuesta en 24h' : '24h Response' },
              { icon: Home, label: locale === 'es' ? 'Residencial & Comercial' : 'Residential & Commercial' },
              { icon: MapPin, label: locale === 'es' ? 'Servicio a domicilio' : 'On-site Service' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/80">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Form */}
      <section ref={formRef} className="py-16 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={formInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-4"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Nombre completo' : 'Full name'} *</Label>
                  <Input
                    required
                    value={form.contactName}
                    onChange={e => handleChange('contactName', e.target.value)}
                    placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Correo electrónico' : 'Email'} *</Label>
                  <Input
                    required
                    type="email"
                    value={form.contactEmail}
                    onChange={e => handleChange('contactEmail', e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Teléfono' : 'Phone'} *</Label>
                  <Input
                    required
                    type="tel"
                    value={form.contactPhone}
                    onChange={e => handleChange('contactPhone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Tipo de instalación' : 'Installation type'}</Label>
                  <Select value={form.type} onValueChange={v => handleChange('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESIDENTIAL">
                        <span className="flex items-center gap-2"><Home className="w-4 h-4" />{locale === 'es' ? 'Residencial' : 'Residential'}</span>
                      </SelectItem>
                      <SelectItem value="COMMERCIAL">
                        <span className="flex items-center gap-2"><Building className="w-4 h-4" />{locale === 'es' ? 'Comercial' : 'Commercial'}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {locale === 'es' ? 'Dirección de Instalación' : 'Installation Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label>{locale === 'es' ? 'Dirección línea 1' : 'Address line 1'} *</Label>
                  <Input
                    required
                    value={form.address1}
                    onChange={e => handleChange('address1', e.target.value)}
                    placeholder={locale === 'es' ? 'Calle y número' : 'Street and number'}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>{locale === 'es' ? 'Dirección línea 2' : 'Address line 2'}</Label>
                  <Input
                    value={form.address2}
                    onChange={e => handleChange('address2', e.target.value)}
                    placeholder={locale === 'es' ? 'Apto, suite, etc.' : 'Apt, suite, etc.'}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Ciudad' : 'City'} *</Label>
                  <Input required value={form.city} onChange={e => handleChange('city', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Estado / Provincia' : 'State / Province'} *</Label>
                  <Input required value={form.state} onChange={e => handleChange('state', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Código Postal' : 'ZIP Code'} *</Label>
                  <Input required value={form.zip} onChange={e => handleChange('zip', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'País' : 'Country'}</Label>
                  <Select value={form.country} onValueChange={v => handleChange('country', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  {locale === 'es' ? 'Detalles del Proyecto' : 'Project Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Número de habitaciones' : 'Number of rooms'}</Label>
                  <Select value={form.rooms} onValueChange={v => handleChange('rooms', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Área de paredes (m²)' : 'Wall area (sq ft)'}</Label>
                  <Input
                    value={form.wallArea}
                    onChange={e => handleChange('wallArea', e.target.value)}
                    placeholder={locale === 'es' ? 'Ej: 45' : 'e.g. 500'}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>{locale === 'es' ? 'Tipo de papel tapiz' : 'Wallpaper type'}</Label>
                  <Select value={form.wallpaperType} onValueChange={v => handleChange('wallpaperType', v)}>
                    <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar tipo' : 'Select type'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vinyl">{locale === 'es' ? 'Vinilo' : 'Vinyl'}</SelectItem>
                      <SelectItem value="fabric">{locale === 'es' ? 'Tela' : 'Fabric'}</SelectItem>
                      <SelectItem value="paper">{locale === 'es' ? 'Papel tradicional' : 'Traditional paper'}</SelectItem>
                      <SelectItem value="grasscloth">{locale === 'es' ? 'Fibra natural' : 'Grasscloth'}</SelectItem>
                      <SelectItem value="ai_custom">{locale === 'es' ? 'Diseño personalizado IA' : 'AI Custom Design'}</SelectItem>
                      <SelectItem value="unknown">{locale === 'es' ? 'No sé / necesito asesoría' : "Don't know / need advice"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>{locale === 'es' ? 'Solicitudes especiales' : 'Special requests'}</Label>
                  <Textarea
                    value={form.specialRequests}
                    onChange={e => handleChange('specialRequests', e.target.value)}
                    rows={3}
                    placeholder={locale === 'es' ? 'Acceso especial, mascotas, horarios específicos...' : 'Special access, pets, specific hours...'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Picker */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {locale === 'es' ? 'Fecha Preferida' : 'Preferred Date'}
                </CardTitle>
                <CardDescription>
                  {locale === 'es'
                    ? 'Elige tu fecha preferida y una alternativa. Los domingos no están disponibles.'
                    : 'Choose your preferred date and an alternative. Sundays are unavailable.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{locale === 'es' ? 'Fecha preferida' : 'Preferred date'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {preferredDate
                          ? format(preferredDate, 'PPP', { locale: dateLocale })
                          : <span className="text-muted-foreground">{locale === 'es' ? 'Seleccionar fecha' : 'Pick a date'}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={preferredDate}
                        onSelect={setPreferredDate}
                        disabled={disabledDays}
                        initialFocus
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>{locale === 'es' ? 'Fecha alternativa' : 'Alternative date'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {alternativeDate
                          ? format(alternativeDate, 'PPP', { locale: dateLocale })
                          : <span className="text-muted-foreground">{locale === 'es' ? 'Seleccionar fecha' : 'Pick a date'}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={alternativeDate}
                        onSelect={setAlternativeDate}
                        disabled={disabledDays}
                        initialFocus
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{locale === 'es' ? 'Enviando...' : 'Sending...'}</>
              ) : (
                <><CalendarIcon className="mr-2 h-5 w-5" />{locale === 'es' ? 'Solicitar Instalación' : 'Request Installation'}</>
              )}
            </Button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
