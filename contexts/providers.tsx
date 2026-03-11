'use client'

import { ThemeProvider } from 'next-themes'
import { SidebarProvider } from './sidebar-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider enableSystem attribute='class' defaultTheme='dark' disableTransitionOnChange>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  )
}
