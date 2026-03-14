'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/components/locale-context';

import { Suspense } from 'react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { locale } = useLocale();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(locale === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || (locale === 'es' ? 'Error al registrar' : 'Error registering'));
      } else {
        toast.success(locale === 'es' ? 'Cuenta creada, iniciando sesión...' : 'Account created, logging in...');
        
        // Auto sign in after registration
        const { signIn } = await import('next-auth/react');
        await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error(locale === 'es' ? 'Ocurrió un error' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-light text-gray-900 tracking-wide">
            {locale === 'es' ? 'CREAR CUENTA' : 'CREATE ACCOUNT'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'es' ? 'O ' : 'Or '}
            <Link href={`/auth/login?callbackUrl=${callbackUrl}`} className="font-medium text-black hover:text-gray-800 underline transition-all">
              {locale === 'es' ? 'inicia sesión si ya tienes cuenta' : 'sign in if you already have an account'}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{locale === 'es' ? 'Nombre Completo' : 'Full Name'}</Label>
              <Input
                id="name"
                type="text"
                required
                className="mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Victor Manuel"
              />
            </div>
            <div>
              <Label htmlFor="email">{locale === 'es' ? 'Correo Electrónico' : 'Email Address'}</Label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="victor@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">{locale === 'es' ? 'Contraseña' : 'Password'}</Label>
              <Input
                id="password"
                type="password"
                required
                className="mt-1"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{locale === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className="mt-1"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === 'es' ? 'Registrarse' : 'Sign Up')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
