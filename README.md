# MERA Tracker 🎯

Sistema de gestión y seguimiento de candidatos para procesos de selección y capacitación en MERA Solutions.

---

## Stack

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Backend**: API Routes (serverless)
- **Base de datos**: PostgreSQL en Supabase
- **ORM**: Prisma
- **Deploy**: Vercel

---

## Deploy paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/federicomserrao-jpg/mera-tracker.git
cd mera-tracker
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Abrí `.env.local` y completá con tus credenciales de Supabase.

**Dónde encontrarlas en Supabase:**
1. Entrá a tu proyecto `ENTREVISTAMERA`
2. Ir a **Settings → Database → Connection string**
3. Copiá la URL del **Transaction pooler** (puerto 6543) → `DATABASE_URL`
4. Copiá la URL del **Session mode** (puerto 5432) → `DIRECT_URL`
5. Reemplazá `[TU_PASSWORD]` con tu contraseña de base de datos

### 3. Crear las tablas en Supabase

```bash
npm run db:push
```

Esto crea todas las tablas directamente. Si querés usar migrations en lugar de push:

```bash
npm run db:migrate
```

### 4. Cargar datos de ejemplo (opcional)

```bash
npm run db:seed
```

Carga 7 candidatos mock con evaluaciones y alertas para probar el sistema.

### 5. Correr en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

### Opción A — Desde la UI de Vercel (recomendado)

1. Subí el proyecto a GitHub
2. En [vercel.com](https://vercel.com) → **New Project** → importar el repo
3. En **Environment Variables**, agregar:
   - `DATABASE_URL` → URL del Transaction pooler de Supabase
   - `DIRECT_URL` → URL del Session mode de Supabase
4. Click en **Deploy**

Vercel detecta Next.js automáticamente. No hace falta configurar nada más.

### Opción B — Desde la CLI

```bash
npm i -g vercel
vercel
# Seguir los pasos del wizard
# Agregar las variables de entorno cuando lo pida
```

---

## Estructura del proyecto

```
mera-tracker/
├── prisma/
│   ├── schema.prisma      # Schema de base de datos
│   └── seed.ts            # Datos de ejemplo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── candidatos/        # GET, POST
│   │   │   ├── candidatos/[id]/   # GET, PATCH, DELETE
│   │   │   ├── alertas/           # GET, POST
│   │   │   ├── dashboard/         # GET métricas
│   │   │   └── export/            # GET CSV
│   │   ├── dashboard/page.tsx
│   │   ├── candidatos/page.tsx
│   │   ├── alertas/page.tsx
│   │   └── reportes/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── index.tsx          # Badges, ScoreBar, StatCard, etc.
│   │   │   └── FiltersBar.tsx
│   │   └── candidatos/
│   │       ├── CandidatoTable.tsx
│   │       └── CandidatoModal.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Singleton Prisma
│   │   └── utils.ts               # calcularRiesgo, generarCSV
│   └── types/
│       └── index.ts               # Tipos TypeScript + Labels
```

---

## Roles disponibles

| Rol | Puede editar |
|-----|-------------|
| Admin | Todas las etapas |
| Operaciones | Solo evaluación de Ops |
| RRHH | Solo evaluación de RRHH |
| Capacitación | Solo evaluación de Cap |

El rol se selecciona desde el panel lateral y se persiste en localStorage.

---

## Lógica de negocio

- **Riesgo ALTO**: alertas en 2 o más etapas distintas
- **Riesgo MEDIO**: alerta en 1 etapa
- **Discrepancia**: diferencia ≥ 2 puntos entre score de Ops y score de Cap → aviso visible en el perfil
- **Export CSV**: exporta exactamente lo que está filtrado en ese momento, con BOM UTF-8 para compatibilidad con Excel argentino

---

## Próximas iteraciones sugeridas

- [ ] Autenticación con Supabase Auth (roles reales por usuario)
- [ ] Notificaciones por email al detectar RIESGO ALTO
- [ ] Historial de cambios con auditoría
- [ ] Métricas de tiempo promedio en cada etapa
