// src/app/api/admin/usuarios/route.ts
// CRUD de usuarios vía Supabase Admin API — solo admin

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

function requireAdmin(role: string) {
  if (role !== 'admin') return NextResponse.json({ error: 'Solo admin puede gestionar usuarios.' }, { status: 403 })
  return null
}

export async function GET() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const denied = requireAdmin(user.user_metadata?.role)
  if (denied) return denied

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    nombre: u.user_metadata?.nombre ?? '',
    role: (u.user_metadata?.role as UserRole) ?? 'operaciones',
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at,
  }))

  return NextResponse.json({ data: users })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const denied = requireAdmin(user.user_metadata?.role)
  if (denied) return denied

  const body = await request.json()
  const { email, password, nombre, role } = body

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Email, contraseña y rol son obligatorios.' }, { status: 400 })
  }

  const validRoles: UserRole[] = ['admin', 'rrhh', 'operaciones', 'capacitacion']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Rol inválido.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: nombre?.trim() || email, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: { id: data.user.id, email: data.user.email, role } }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const denied = requireAdmin(user.user_metadata?.role)
  if (denied) return denied

  const body = await request.json()
  const { id, role, nombre } = body
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, {
    user_metadata: { role, nombre },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: { ok: true } })
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const denied = requireAdmin(user.user_metadata?.role)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 })

  // No permitir que admin se elimine a sí mismo
  if (id === user.id) return NextResponse.json({ error: 'No podés eliminarte a vos mismo.' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: { ok: true } })
}
