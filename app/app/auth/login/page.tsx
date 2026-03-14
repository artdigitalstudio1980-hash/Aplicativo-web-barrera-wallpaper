'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/components/locale-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { locale } = useLocale();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (res?.error) {
        toast.error(locale === 'es' ? 'Credenciales inválidas' : 'Invalid credentials');
      } else {
        toast.success(locale === 'es' ? 'Sesión iniciada' : 'Logged in successfully');
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
            {locale === 'es' ? 'INICIAR SESIÓN' : 'SIGN IN'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'es' ? 'O ' : 'Or '}
            <Link href={`/auth/register?callbackUrl=${callbackUrl}`} className="font-medium text-black hover:text-gray-800 underline transition-all">
              {locale === 'es' ? 'crea una cuenta nueva' : 'create a new account'}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === 'es' ? 'Ingresar' : 'Sign in')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
