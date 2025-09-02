import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { initDB } from '@/lib/db';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talvio - Where Talent Meets Vision',
  description: 'AI-powered CV Scoring • Mock Interviews • Coding Practice',
};

// Initialize database only in runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  initDB().catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-navy-950 text-gray-100`}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #475569'
            }
          }}
        />
      </body>
    </html>
  );
}