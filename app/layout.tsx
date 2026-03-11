import Providers from '@/contexts/providers'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'TylooTube',
  description:
    'A modern YouTube clone built with Next.js 15, TailwindCSS and ShadCN, leveraging the latest web technologies to create a seamless video sharing and viewing experience.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
