// src/app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MERA Tracker',
  description: 'Sistema de gestión de colaboradores — MERA Solutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
