import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloud PMS — Smart Hotel & Property Management',
  description:
    'The cloud property management system for hotels, apartments and vacation rentals. Self check-in, smart locks, channel manager and real-time analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
