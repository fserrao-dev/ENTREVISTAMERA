// src/app/(protected)/layout.tsx
// Layout compartido para todas las páginas protegidas

import AppShell from '@/components/layout/AppShell'

export const dynamic = 'force-dynamic'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
