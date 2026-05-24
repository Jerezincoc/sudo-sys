import React from 'react'
import { useWizardStore } from '@/state/wizardStore'
import { ipcClient } from '@/api/ipcClient'

function InfoRow({ label, value, faded }: { label: string; value: string; faded?: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '140px 1fr',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <div style={{ padding: '3px 8px', fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', background: 'var(--color-bg-ribbon)', borderRight: '1px solid var(--color-border-light)' }}>
        {label}
      </div>
      <div style={{ padding: '3px 8px', fontSize: 11, color: faded ? 'var(--color-text-muted)' : 'var(--color-text-primary)', fontFamily: faded ? 'inherit' : 'Consolas, monospace', fontStyle: faded ? 'italic' : 'normal' }}>
        {value}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '3px 8px',
      background: 'var(--color-bg-ribbon)',
      borderBottom: '2px solid var(--color-brand)',
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-text-primary)',
    }}>
      {children}
    </div>
  )
}

export default function ConclusionStep() {
  const { db, empresa, saving, savedOk, saveError, setSaving, setSavedOk, setSaveError, prevStep } = useWizardStore()

  async function handleStart() {
    setSaving(true)
    setSaveError(null)
    try {
      const result = await ipcClient.saveConfig({
        database: {
          type: db.type,
          connectionString: db.type === 'postgres' ? db.connectionString : undefined,
        },
        empresa: empresa.skipped
          ? { razaoSocial: '', cnpj: '', endereco: '', responsavel: '' }
          : { razaoSocial: empresa.razaoSocial, cnpj: empresa.cnpj, endereco: empresa.endereco, responsavel: empresa.responsavel },
      })
      if (result.success) {
        setSavedOk(true)
        setTimeout(() => window.location.reload(), 1800)
      } else {
        setSaveError(result.error ?? 'Erro desconhecido ao salvar configuração.')
      }
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  /* ── Sucesso ───────────────────────────────────────────────────── */
  if (savedOk) {
    return (
      <div style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, color: 'var(--color-btn-add)', marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
          Configuração concluída!
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          SudoSys foi configurado com sucesso. Iniciando o sistema...
        </div>
      </div>
    )
  }

  /* ── Resumo ────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '24px 32px', maxWidth: 620 }}>

      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--color-brand)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>
          Revisão / Passo 4 de 4
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>
          Revisão das Configurações
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
          Verifique as configurações antes de iniciar o sistema.
          Tudo pode ser alterado posteriormente nas Configurações.
        </div>
      </div>

      {/* DB section */}
      <div style={{ border: '1px solid var(--color-border-main)', marginBottom: 12 }}>
        <SectionTitle>Banco de Dados</SectionTitle>
        <InfoRow label="Tipo" value={db.type === 'sqlite' ? 'SQLite local' : 'PostgreSQL externo'} />
        {db.type === 'sqlite'   && <InfoRow label="Arquivo"    value="{userData}/banco/sudosys.db" />}
        {db.type === 'postgres' && <InfoRow label="Connection" value={db.connectionString.replace(/:[^:@]+@/, ':***@')} />}
      </div>

      {/* Empresa section */}
      <div style={{ border: '1px solid var(--color-border-main)', marginBottom: 16 }}>
        <SectionTitle>
          Empresa
          {empresa.skipped && (
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, color: '#7a4f00' }}>
              (não configurada)
            </span>
          )}
        </SectionTitle>

        {empresa.skipped ? (
          <div style={{ padding: '8px 10px', background: '#fff8e1', fontSize: 11, color: '#7a4f00' }}>
            ⚠ Dados da empresa não informados. Será solicitado ao gerar o primeiro documento.
          </div>
        ) : (
          <>
            <InfoRow label="Razão Social" value={empresa.razaoSocial || '—'} faded={!empresa.razaoSocial} />
            <InfoRow label="CNPJ"         value={empresa.cnpj        || '—'} faded={!empresa.cnpj}        />
            <InfoRow label="Endereço"     value={empresa.endereco    || '—'} faded={!empresa.endereco}    />
            <InfoRow label="Responsável"  value={empresa.responsavel || '—'} faded={!empresa.responsavel} />
          </>
        )}
      </div>

      {/* Error */}
      {saveError && (
        <div style={{ marginBottom: 12, padding: '6px 10px', background: '#fdf2f2', border: '1px solid var(--color-btn-del)', fontSize: 11, color: 'var(--color-btn-del)' }}>
          <strong>Erro:</strong> {saveError}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 20,
        paddingTop: 12,
        borderTop: '1px solid var(--color-border-main)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={prevStep}
          disabled={saving}
          style={{ height: 26, padding: '0 14px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)', color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer', opacity: saving ? 0.4 : 1 }}
        >
          ← Anterior
        </button>
        <button
          onClick={handleStart}
          disabled={saving}
          style={{
            height: 28,
            padding: '0 20px',
            border: '1px solid var(--color-btn-add)',
            background: 'var(--color-btn-add)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Salvando...' : '▶  Iniciar Sistema'}
        </button>
      </div>
    </div>
  )
}
