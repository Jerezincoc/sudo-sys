export interface Usuario {
  id: number
  nome: string
  email: string
  papel: 'admin' | 'operador' | 'visualizador'
  ativo: number
  ultimo_login?: string | null
  created_at: string
  updated_at: string
}

export interface LoginPayload { email: string; senha: string }
export interface LoginResult { success: boolean; usuario?: Usuario; token?: string; error?: string }
