import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { ConfirmProvider } from '@/components/ui/confirm-dialog'
import './globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

export const metadata: Metadata = {
  title: 'S7',
  description: 'S7 Team: курсы, ивенты и инструменты по IT и робототехнике',
  generator: 'S7 Team',
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
