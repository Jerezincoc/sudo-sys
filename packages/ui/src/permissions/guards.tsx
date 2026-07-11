import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermission } from './usePermission'
import { ROUTES } from '@/app/routes'

/** Bloqueia uma rota para quem não é admin, mandando de volta pro Dashboard.
 *  A checagem real (que não pode ser contornada só escondendo o menu) é no
 *  backend — ver app-host/src/ipc/authGuard.ts. Isto aqui é só para não deixar
 *  a tela abrir para quem não devia nem vê-la. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = usePermission()
  if (!isAdmin) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <>{children}</>
}
