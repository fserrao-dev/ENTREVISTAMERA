'use client'
// src/components/layout/AppShell.tsx

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

const TITLES: Record<string, string> = {
  '/dashboard':      'Dashboard',
  '/candidatos':     'Candidatos',
  '/alertas':        'Centro de Alertas',
  '/reportes':       'Reportes',
  '/admin/usuarios': 'Gestión de Usuarios',
}

interface AppShellProps {
  children: React.ReactNode
  alertCount?: number
}

interface SessionUser {
  email: string
  role: UserRole
  nombre: string
}

export default function AppShell({ children, alertCount = 0 }: AppShellProps) {
  const path = usePathname()
  const router = useRouter()
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSessionUser({
          email: data.user.email ?? '',
          role: (data.user.user_metadata?.role as UserRole) ?? 'operaciones',
          nombre: data.user.user_metadata?.nombre ?? data.user.email ?? '',
        })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  const role = sessionUser?.role ?? 'operaciones'
  const roleLabel: Record<UserRole, string> = {
    admin: 'Admin',
    operaciones: 'Operaciones',
    rrhh: 'RRHH',
    capacitacion: 'Capacitación',
  }

  const title = Object.entries(TITLES).find(([k]) => path.startsWith(k))?.[1] ?? 'MERA Tracker'
  const showNewBtn = path.startsWith('/candidatos')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar alertCount={alertCount} role={role} sessionUser={sessionUser} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              Rol: <b style={{ color: 'var(--text2)' }}>{roleLabel[role]}</b>
            </span>
            {showNewBtn && (
              <button
                className="btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('mera_open_new_candidate'))}
              >
                + Nuevo Colaborador
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
