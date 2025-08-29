import type { Metadata } from 'next'
import './globals.css'

import { Cursor } from '@/components/Cursor'
import { Header } from '@/components/Header'
import { Providers } from '@/lib/query-provider'
import { Toaster } from 'sonner'
import { FraktionMono, NeueMachina } from './fonts'

export const metadata: Metadata = {
  title: 'omentejovem',
  description: 'omentejovem website'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${NeueMachina.variable} ${FraktionMono.variable} bg-background`}
      >
        <Providers>
          <div className="max-w-[1920px] mx-auto">
            <Cursor />
            <Header />
            {children}
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            closeButton
          />
        </Providers>
      </body>
    </html>
  )
}
