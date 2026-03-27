import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Emoji Fusion — Fuse Emojis with AI',
  description: 'Select any emojis and fuse them into a brand new AI-generated emoji. Futuristic, fun, and endlessly creative.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Emoji Fusion',
    description: 'AI-powered emoji fusion tool',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable}`}>
      <body className="bg-void font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0d0d1a',
                color: '#f0f0ff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: 'var(--font-syne)',
                fontSize: '14px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
