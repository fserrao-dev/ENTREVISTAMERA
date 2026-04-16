'use client'
// src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { href: '/candidatos', icon: '👥', label: 'Candidatos' },
  { href: '/alertas',    icon: '🚨', label: 'Alertas' },
  { href: '/reportes',   icon: '📈', label: 'Reportes' },
]

interface SidebarProps {
  alertCount?: number
  role: UserRole
  sessionUser: { email: string; nombre: string } | null
}

export default function Sidebar({ alertCount = 0, role, sessionUser }: SidebarProps) {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>MERA Tracker</h1>
        <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Gestión de Colaboradores
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                background: active ? '#6366f115' : 'transparent',
                color: active ? '#818cf8' : 'var(--text2)',
                fontWeight: active ? 500 : 400,
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Alertas' && alertCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--red)', color: '#fff',
                    fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 600,
                  }}>
                    {alertCount}
                  </span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Link admin solo para admin */}
        {role === 'admin' && (
          <Link href="/admin/usuarios" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              fontSize: 13, cursor: 'pointer', transition: 'all .15s',
              background: path.startsWith('/admin') ? '#6366f115' : 'transparent',
              color: path.startsWith('/admin') ? '#818cf8' : 'var(--text2)',
              fontWeight: path.startsWith('/admin') ? 500 : 400,
            }}>
              <span style={{ fontSize: 15 }}>⚙️</span>
              <span>Usuarios</span>
            </div>
          </Link>
        )}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 12px', marginBottom: 8,
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sessionUser?.nombre || sessionUser?.email || '...'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {({ admin: 'Admin', operaciones: 'Operaciones', rrhh: 'RRHH', capacitacion: 'Capacitación' } as Record<UserRole, string>)[role]}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text3)', padding: '7px 10px', borderRadius: 7, fontSize: 12,
            cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
