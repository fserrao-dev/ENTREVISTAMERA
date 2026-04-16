// src/app/page.tsx
// Redirige la raíz a /dashboard (el middleware maneja la auth)

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
