// scripts/seed-users.ts
// Crea los usuarios iniciales del sistema en Supabase Auth
// Ejecutar: npx tsx scripts/seed-users.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno. Revisá .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── USUARIOS A CREAR ─────────────────────────────────────
// Cambiá los emails y contraseñas antes de ejecutar
const USUARIOS = [
  {
    email: 'admin@mera.com',
    password: 'Admin2024!',
    nombre: 'Administrador',
    role: 'admin',
  },
  {
    email: 'rrhh@mera.com',
    password: 'Rrhh2024!',
    nombre: 'Recursos Humanos',
    role: 'rrhh',
  },
  {
    email: 'operaciones@mera.com',
    password: 'Ops2024!',
    nombre: 'Operaciones',
    role: 'operaciones',
  },
  {
    email: 'capacitacion@mera.com',
    password: 'Cap2024!',
    nombre: 'Capacitación',
    role: 'capacitacion',
  },
]

async function main() {
  console.log('Creando usuarios en Supabase...\n')

  for (const u of USUARIOS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        nombre: u.nombre,
        role: u.role,
      },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⚠  ${u.email} — ya existe, se omite.`)
      } else {
        console.error(`❌ ${u.email} — ${error.message}`)
      }
    } else {
      console.log(`✓  ${u.email} — creado (${u.role})  id: ${data.user.id}`)
    }
  }

  console.log('\nListo. Podés cambiar contraseñas desde /admin/usuarios en la app.')
}

main().catch(e => { console.error(e); process.exit(1) })
