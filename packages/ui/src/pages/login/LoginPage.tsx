import React, { useState, useRef, useEffect } from 'react'
import { ipcClient } from '@/api/ipcClient'
import { useSessionStore, usuarioToSessionUser } from '@/state/sessionSlice'

interface Props {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const senhaRef = useRef<HTMLInputElement>(null)
  const { setUser } = useSessionStore()

  useEffect(() => {
    document.title = 'SudoSys — Acesso ao Sistema'
  }, [])

  async function handleSubmit() {
    if (!email.trim() || !senha) return
    setLoading(true)
    setError(null)
    const res = await ipcClient.login({ email: email.trim(), senha })
    setLoading(false)
    if (!res.success || !res.usuario || !res.token) {
      setError(res.error ?? 'Falha ao autenticar.')
      return
    }
    setUser(usuarioToSessionUser(res.usuario), res.token)
    onLogin()
  }

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
      {/* Card */}
      <div style={{
        width: 380,
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header brand */}
        <div style={{
          background: 'var(--color-brand)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} stroke="white" strokeWidth={2.5}>
              <rect x={3} y={3} width={7} height={7} rx={0} />
              <rect x={14} y={3} width={7} height={7} rx={0} />
              <rect x={3} y={14} width={7} height={7} rx={0} />
              <rect x={14} y={14} width={7} height={7} rx={0} />
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>SudoSys</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>Gestão de Folha de Pagamento</div>
          </div>
        </div>

        {/* Title bar */}
        <div style={{
          padding: '10px 20px 0',
          borderBottom: '1px solid var(--color-border-main)',
          paddingBottom: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Acesso ao Sistema
          </div>
        </div>

        {/* Form body */}
        <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') senhaRef.current?.focus() }}
              style={inputStyle}
              placeholder="usuario@empresa.com"
              disabled={loading}
            />
          </Field>

          <Field label="Senha">
            <input
              ref={senhaRef}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              style={inputStyle}
              placeholder="••••••••"
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
            disabled={loading || !email.trim() || !senha}
            style={{
              marginTop: 4,
              height: 28,
              background: 'var(--color-brand)',
              color: '#fff',
              border: '1px solid var(--color-brand)',
              fontSize: 12,
              fontWeight: 600,
              cursor: loading || !email.trim() || !senha ? 'not-allowed' : 'pointer',
              opacity: loading || !email.trim() || !senha ? 0.65 : 1,
              letterSpacing: '0.03em',
              borderRadius: 0,
            }}
          >
            {loading ? 'Autenticando…' : 'Entrar'}
          </button>
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 20px 12px',
          fontSize: 10,
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border-main)',
          background: 'var(--color-bg-panel)',
        }}>
          Primeiro acesso? Use <strong>admin@sudosys.local</strong> / <strong>admin123</strong>
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
