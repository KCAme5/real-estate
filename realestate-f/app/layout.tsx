// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "@/components/theme-provider"
import LayoutWrapper from '@/components/LayoutWrapper';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KenyaPrime Properties | Luxury Real Estate for Kenyans & Diaspora',
  description: 'Premium real estate solutions connecting Kenyans and the diaspora with exceptional properties and investment opportunities across Kenya.',
  keywords: 'real estate, Kenya properties, diaspora, luxury homes, investment properties',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/KenyaPrime.png' }
    ],
    shortcut: '/favicon.svg',
    apple: '/KenyaPrime.png',
  }
};


import Header from '@/components/layout/Header';
import QueryProvider from '@/components/providers/QueryProvider';
import Footer from '@/components/layout/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          disableTransitionOnChange
          storageKey="kenyaprime-theme"
        >
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <LayoutWrapper>
                  <Header />
                  <div className="pt-20">
                    {children}
                  </div>
                  <Footer />
                </LayoutWrapper>
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}