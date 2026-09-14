import React, { useState, useRef, useEffect } from 'react'
import { ipcClient } from '@/api/ipcClient'
import { useSessionStore } from '@/state/sessionSlice'

interface Props {
  onDone: () => void
}

export default function TrocarSenhaPage({ onDone }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const novaSenhaRef = useRef<HTMLInputElement>(null)
  const confirmarSenhaRef = useRef<HTMLInputElement>(null)
  const { token } = useSessionStore()

  useEffect(() => {
    document.title = 'SudoSys — Trocar Senha'
  }, [])

  async function handleSubmit() {
    if (!senhaAtual || !novaSenha || !confirmarSenha || !token) return
    if (novaSenha.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setError('A confirmação não coincide com a nova senha.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await ipcClient.trocarSenha({ token, senhaAtual, novaSenha })
    setLoading(false)
    if (!res.success) {
      setError(res.error ?? 'Falha ao trocar senha.')
      return
    }
    onDone()
  }

  const podeEnviar = !loading && !!senhaAtual && !!novaSenha && !!confirmarSenha

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-app)',
      flexDirection: 'column',
      gap: 0,
      userSelect: 'none',
    }}>
      <div style={{
        width: 380,
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          background: 'var(--color-brand)',
          padding: '16px 20px',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>SudoSys</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>Gestão de Folha de Pagamento</div>
        </div>

        <div style={{
          padding: '10px 20px 0',
          borderBottom: '1px solid var(--color-border-main)',
          paddingBottom: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Troca de Senha Obrigatória
          </div>
        </div>

        <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Este acesso ainda usa a senha padrão. Defina uma nova senha antes de continuar.
          </div>

          <Field label="Senha atual">
            <input
              type="password"
              value={senhaAtual}
              autoFocus
              onChange={(e) => setSenhaAtual(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') novaSenhaRef.current?.focus() }}
              style={inputStyle}
              disabled={loading}
            />
          </Field>

          <Field label="Nova senha">
            <input
              ref={novaSenhaRef}
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmarSenhaRef.current?.focus() }}
              style={inputStyle}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
            />
          </Field>

          <Field label="Confirmar nova senha">
            <input
              ref={confirmarSenhaRef}
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              style={inputStyle}
              disabled={loading}
            />
          </Field>

          {error && (
            <div style={{
              fontSize: 11,
              color: '#c0392b',
              background: '#fdf0ef',
              border: '1px solid #e8c4c0',
              padding: '6px 10px',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!podeEnviar}
            style={{
              marginTop: 4,
              height: 28,
              background: 'var(--color-brand)',
              color: '#fff',
              border: '1px solid var(--color-brand)',
              fontSize: 12,
              fontWeight: 600,
              cursor: podeEnviar ? 'pointer' : 'not-allowed',
              opacity: podeEnviar ? 1 : 0.65,
              letterSpacing: '0.03em',
              borderRadius: 0,
            }}
          >
            {loading ? 'Salvando…' : 'Trocar senha e continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: 26,
  padding: '0 8px',
  fontSize: 12,
  border: '1px solid var(--color-border-main)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  borderRadius: 0,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
