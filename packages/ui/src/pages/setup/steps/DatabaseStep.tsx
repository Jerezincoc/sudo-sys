import React, { useState } from 'react'
import { useWizardStore } from '@/state/wizardStore'
import { ipcClient } from '@/api/ipcClient'

function StatusBadge({ status, error }: { status: string; error?: string | null }) {
  if (status === 'idle') return null
  if (status === 'testing') return (
    <span style={{ fontSize: 11, color: '#8b5e00', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, border: '1px solid #8b5e00', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      Testando conexão...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </span>
  )
  if (status === 'ok') return (
    <span style={{ fontSize: 11, color: 'var(--color-btn-add)', fontWeight: 600 }}>
      ✓ Conexão estabelecida com sucesso
    </span>
  )
  return (
    <span style={{ fontSize: 11, color: 'var(--color-btn-del)', fontWeight: 600 }}>
      ✕ Falha na conexão{error ? ` — ${error}` : ''}
    </span>
  )
}

export default function DatabaseStep() {
  const { db, setDbType, setConnectionString, setDbTestStatus, nextStep, prevStep } = useWizardStore()

  const canProceed = db.type === 'sqlite' || (db.type === 'postgres' && db.testStatus === 'ok')

  async function handleTest() {
    if (db.type === 'postgres' && !db.connectionString.trim()) return
    setDbTestStatus('testing')
    try {
      const result = await ipcClient.testDatabase({
        type: db.type,
        connectionString: db.type === 'postgres' ? db.connectionString : undefined,
      })
      if (result.success) setDbTestStatus('ok', null, result.latencyMs ?? null)
      else setDbTestStatus('error', result.error ?? 'Falha desconhecida')
    } catch (err) {
      setDbTestStatus('error', String(err))
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--color-brand)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>
          Banco de Dados / Passo 2 de 4
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>Banco de Dados</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
          Escolha onde os dados do sistema serão armazenados.
          Para a maioria das instalações, o SQLite local é recomendado.
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* SQLite */}
        <div
          onClick={() => setDbType('sqlite')}
          style={{
            border: `2px solid ${db.type === 'sqlite' ? 'var(--color-brand)' : 'var(--color-border-main)'}`,
            background: db.type === 'sqlite' ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            border: `2px solid ${db.type === 'sqlite' ? 'var(--color-brand)' : 'var(--color-border-main)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}>
            {db.type === 'sqlite' && <div style={{ width: 8, height: 8, background: 'var(--color-brand)' }} />}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              SQLite local
              <span style={{ fontSize: 10, background: 'var(--color-brand)', color: '#fff', padding: '1px 6px', fontWeight: 400 }}>
                Recomendado
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
              Banco embutido, armazenado como arquivo local. Zero configuração, backup simples.
            </div>
            {db.type === 'sqlite' && (
              <div style={{ marginTop: 6, padding: '2px 8px', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-light)', fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {'{userData}'}/banco/sudosys.db
              </div>
            )}
          </div>
        </div>

        {/* PostgreSQL */}
        <div
          onClick={() => setDbType('postgres')}
          style={{
            border: `2px solid ${db.type === 'postgres' ? 'var(--color-brand)' : 'var(--color-border-main)'}`,
            background: db.type === 'postgres' ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            border: `2px solid ${db.type === 'postgres' ? 'var(--color-brand)' : 'var(--color-border-main)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}>
            {db.type === 'postgres' && <div style={{ width: 8, height: 8, background: 'var(--color-brand)' }} />}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>PostgreSQL externo</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
              Conecta a um servidor PostgreSQL existente. Indicado para ambientes multi-usuário.
            </div>
          </div>
        </div>
      </div>

      {/* Connection string (PostgreSQL only) */}
      {db.type === 'postgres' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Connection String
          </label>
          <input
            type="text"
            value={db.connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgresql://usuario:senha@host:5432/banco"
            style={{
              width: '100%',
              height: 26,
              padding: '0 8px',
              border: '1px solid var(--color-border-main)',
              background: 'var(--color-bg-white)',
              color: 'var(--color-text-primary)',
              fontSize: 11,
              fontFamily: 'Consolas, monospace',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3 }}>
            Exemplo: postgresql://admin:senha@localhost:5432/sudosys_db
          </div>

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleTest}
              disabled={!db.connectionString.trim() || db.testStatus === 'testing'}
              style={secondaryBtn}
            >
              Testar conexão
            </button>
            <StatusBadge status={db.testStatus} error={db.testError} />
          </div>
        </div>
      )}

      {/* SQLite test */}
      {db.type === 'sqlite' && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleTest}
            disabled={db.testStatus === 'testing'}
            style={secondaryBtn}
          >
            Verificar permissões de escrita
          </button>
          <StatusBadge status={db.testStatus} error={db.testError} />
        </div>
      )}

      {/* Footer nav */}
      <WizardFooter
        onPrev={prevStep}
        onNext={nextStep}
        nextDisabled={!canProceed}
      />
    </div>
  )
}

const secondaryBtn: React.CSSProperties = {
  height: 26,
  padding: '0 12px',
  border: '1px solid var(--color-border-main)',
  background: 'var(--color-bg-panel)',
  color: 'var(--color-text-primary)',
  fontSize: 11,
  cursor: 'pointer',
}

function WizardFooter({ onPrev, onNext, nextDisabled }: { onPrev: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <div style={{
      marginTop: 20,
      paddingTop: 12,
      borderTop: '1px solid var(--color-border-main)',
      display: 'flex',
      justifyContent: 'space-between',
    }}>
      <button
        onClick={onPrev}
        style={{
          height: 26,
          padding: '0 14px',
          border: '1px solid var(--color-border-main)',
          background: 'var(--color-bg-panel)',
          color: 'var(--color-text-secondary)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        ← Anterior
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          height: 26,
          padding: '0 20px',
          border: '1px solid var(--color-brand)',
          background: nextDisabled ? 'var(--color-border-main)' : 'var(--color-brand)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          opacity: nextDisabled ? 0.5 : 1,
        }}
      >
        Próximo →
      </button>
    </div>
  )
}
