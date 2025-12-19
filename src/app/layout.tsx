import type { Metadata } from 'next'
import './globals.css'

import { Cursor } from '@/components/Cursor'
import { Header } from '@/components/Header'
import { Providers } from '@/lib/query-provider'
import { Toaster } from 'sonner'
import { FraktionMono, NeueMachina } from './fonts'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://omentejovem.vercel.app'
  ),
  title: 'omentejovem',
  description: 'omentejovem website',
  manifest: '/manifest.json',
  authors: [{ name: 'Luis Bovo', url: 'https://luisbovo.com' }]
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch para domínios críticos */}
        <link rel="dns-prefetch" href="//vercel.app" />
        <link rel="dns-prefetch" href="//supabase.co" />
      </head>
      <body
        className={`${NeueMachina.variable} ${FraktionMono.variable} bg-background min-h-screen`}
      >
        <Providers>
          {/* Layout otimizado para evitar CLS */}
          <div className="mx-auto min-h-screen flex flex-col">
            <Cursor />
            {/* Header com altura fixa */}
            <Header />
            {/* Main content */}
            <main className="flex-grow max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#1f2937',
                border: '1px solid #374151',
                color: '#f9fafb'
              }
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
