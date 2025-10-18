import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { ConfirmProvider } from '@/components/ui/confirm'
import './globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://s7robotics.space'),
  title: {
    default: 'S7 Robotics',
    template: '%s | S7 Robotics',
  },
  description: 'S7 Robotics: курсы, ивенты и инструменты по IT и робототехнике',
  generator: 'S7 Robotics',
  applicationName: 'S7 Robotics',
  openGraph: {
    type: 'website',
    url: 'https://s7robotics.space',
    title: 'S7 Robotics',
    description: 'Курсы, ивенты и инструменты по IT и робототехнике',
    siteName: 'S7 Robotics',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: 'S7 Robotics' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@s7robotics',
    title: 'S7 Robotics',
    description: 'Курсы, ивенты и инструменты по IT и робототехнике',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/logo-s7.png',
    shortcut: '/logo-s7.png',
    apple: '/logo-s7.png',
  },
  themeColor: '#0e0e12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <ConfirmProvider>
            {children}
            <Toaster />
          </ConfirmProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
