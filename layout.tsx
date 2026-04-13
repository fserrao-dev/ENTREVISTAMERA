'use client'
// src/components/layout/AppShell.tsx
// Wrapper que provee el sidebar + topbar + role global a toda la app

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

const TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/candidatos': 'Candidatos',
  '/alertas':    'Centro de Alertas',
  '/reportes':   'Reportes',
}

interface AppShellProps {
  children: React.ReactNode
  alertCount?: number
}

export default function AppShell({ children, alertCount = 0 }: AppShellProps) {
  const path = usePathname()
  const [role, setRole] = useState('admin')

  // Persiste el rol en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mera_role')
    if (saved) setRole(saved)
  }, [])

  const handleRoleChange = (r: string) => {
    setRole(r)
    localStorage.setItem('mera_role', r)
    // Propagamos el rol a los hijos via un evento custom
    window.dispatchEvent(new CustomEvent('mera_role_change', { detail: r }))
  }

  const title = Object.entries(TITLES).find(([k]) => path.startsWith(k))?.[1] ?? 'MERA Tracker'
  const showNewBtn = path.startsWith('/candidatos')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar alertCount={alertCount} role={role} onRoleChange={handleRoleChange} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              Rol: <b style={{ color: 'var(--text2)' }}>
                {{ admin: 'Admin', operaciones: 'Operaciones', rrhh: 'RRHH', capacitacion: 'Capacitación' }[role]}
              </b>
            </span>
            {showNewBtn && (
              <button
                className="btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('mera_open_new_candidate'))}
              >
                + Nuevo Candidato
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
