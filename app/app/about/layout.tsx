import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Oscar Barrera and Barrera Wallpaper — a premium wall coverings brand merging art, design, and technology to create extraordinary spaces.',
  keywords: 'Oscar Barrera, Barrera Wallpaper story, about us, wallpaper artist, interior design brand Miami',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Barrera Wallpaper',
    description: 'Learn about Oscar Barrera — a premium wall coverings brand merging art, design, and technology.',
    type: 'profile',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
