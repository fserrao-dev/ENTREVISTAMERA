'use client'
// src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/candidatos', icon: '👥', label: 'Candidatos' },
  { href: '/alertas',    icon: '🚨', label: 'Alertas' },
  { href: '/reportes',   icon: '📈', label: 'Reportes' },
]

interface SidebarProps {
  alertCount?: number
  role: string
  onRoleChange: (r: string) => void
}

export default function Sidebar({ alertCount = 0, role, onRoleChange }: SidebarProps) {
  const path = usePathname()

  return (
    <aside style={{ width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>MERA Tracker</h1>
        <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Gestión de Candidatos</span>
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
                  <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>
                    {alertCount}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Role selector */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Mi Rol</div>
        <select
          value={role}
          onChange={e => onRoleChange(e.target.value)}
          style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}
        >
          <option value="admin">Admin</option>
          <option value="operaciones">Operaciones</option>
          <option value="rrhh">RRHH</option>
          <option value="capacitacion">Capacitación</option>
        </select>
      </div>
    </aside>
  )
}
