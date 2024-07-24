import type { Metadata } from 'next'
import './globals.css'

import { Header } from '@/components/Header'
import { Cursor } from '@/components/Cursor'
import { NeueMachina, FraktionMono } from './fonts'
import { Providers } from '@/lib/query-provider'

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
        </Providers>
      </body>
    </html>
  )
}
