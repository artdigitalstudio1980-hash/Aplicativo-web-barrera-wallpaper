import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Wallpaper Studio',
  description: 'Create one-of-a-kind wallpaper designs with AI. Describe your vision and our AI engine generates a unique, print-ready wallpaper pattern just for you.',
  keywords: 'AI wallpaper generator, custom AI design, generative wallpaper, unique wallpaper art, AI interior design',
  alternates: { canonical: '/ai-studio' },
  openGraph: {
    title: 'AI Wallpaper Studio - Barrera Wallpaper',
    description: 'Generate unique, print-ready wallpaper designs powered by AI. Describe your vision and we create it.',
    type: 'website',
  },
};

export default function AIStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
