import { useSessionStore } from '@/state/sessionSlice'
import type { SessionUser } from '@/state/sessionSlice'

/** Papel do usuário logado (ou undefined se não houver sessão) e um atalho para
 *  "isAdmin". Só existe a distinção admin/não-admin hoje — não há uma matriz de
 *  permissões por módulo definida para os demais papéis. */
export function usePermission() {
  const role = useSessionStore((s) => s.user?.role)
  return {
    role: role as SessionUser['role'] | undefined,
    isAdmin: role === 'admin',
  }
}
