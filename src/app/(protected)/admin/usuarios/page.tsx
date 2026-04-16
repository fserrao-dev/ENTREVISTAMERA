'use client'
// src/app/(protected)/admin/usuarios/page.tsx
// Solo accesible para role === 'admin'

import { useState, useEffect } from 'react'
import type { UserRole } from '@/types'
import { ROLE_LABELS } from '@/types'
import { Spinner } from '@/components/ui'

interface UserItem {
  id: string
  email: string
  nombre: string
  role: UserRole
  createdAt: string
  lastSignIn: string | null
}

const ROLES: UserRole[] = ['admin', 'rrhh', 'operaciones', 'capacitacion']

const ROLE_COLOR: Record<UserRole, string> = {
  admin:        'badge-purple',
  rrhh:         'badge-blue',
  operaciones:  'badge-green',
  capacitacion: 'badge-gray',
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [editUser, setEditUser] = useState<UserItem | null>(null)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    setUsers(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`¿Eliminar a ${u.nombre || u.email}? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/admin/usuarios?id=${u.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    fetchUsers()
  }

  const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, borderBottom: '1px solid rgba(42,51,72,0.3)', verticalAlign: 'middle' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Usuarios del sistema</h3>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Creá y gestioná los accesos de cada área.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>+ Nuevo usuario</button>
      </div>

      {error && (
        <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nombre', 'Email', 'Rol', 'Último acceso', 'Acciones'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{u.nombre || '—'}</div>
                  </td>
                  <td style={{ ...td, color: 'var(--text2)' }}>{u.email}</td>
                  <td style={td}><span className={ROLE_COLOR[u.role]}>{ROLE_LABELS[u.role]}</span></td>
                  <td style={{ ...td, color: 'var(--text3)', fontSize: 11 }}>
                    {u.lastSignIn ? new Date(u.lastSignIn).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 12px', fontSize: 11 }}
                        onClick={() => setEditUser(u)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '5px 12px', fontSize: 11 }}
                        onClick={() => handleDelete(u)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>
                    No hay usuarios creados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NuevoUsuarioModal
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); fetchUsers() }}
        />
      )}

      {editUser && (
        <EditarUsuarioModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); fetchUsers() }}
        />
      )}
    </div>
  )
}

// ─── MODAL NUEVO USUARIO ──────────────────────────────────

function NuevoUsuarioModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
        nombre: fd.get('nombre'),
        role: fd.get('role'),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onSaved()
  }

  const inputStyle = { width: '100%', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: 7, fontSize: 13 }
  const labelStyle = { display: 'block' as const, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Nuevo usuario</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input name="nombre" style={inputStyle} placeholder="Juan Pérez" />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input name="email" type="email" required style={inputStyle} placeholder="usuario@mera.com" />
            </div>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input name="password" type="password" required minLength={8} style={inputStyle} placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label style={labelStyle}>Rol *</label>
              <select name="role" required style={{ ...inputStyle, cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            {error && (
              <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MODAL EDITAR USUARIO ─────────────────────────────────

function EditarUsuarioModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState<UserRole>(user.role)
  const [nombre, setNombre] = useState(user.nombre)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role, nombre }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onSaved()
  }

  const inputStyle = { width: '100%', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: 7, fontSize: 13 }
  const labelStyle = { display: 'block' as const, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Editar usuario</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ ...labelStyle, color: 'var(--text3)' }}>Email (no editable)</label>
              <div style={{ fontSize: 13, color: 'var(--text2)', padding: '9px 12px', background: 'var(--bg)', borderRadius: 7, border: '1px solid var(--border)' }}>{user.email}</div>
            </div>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Juan Pérez" />
            </div>
            <div>
              <label style={labelStyle}>Rol *</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            {error && (
              <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
