import React from 'react'
import { useWizardStore } from '@/state/wizardStore'
import { ipcClient } from '@/api/ipcClient'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-surface-600 last:border-0">
      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-gray-200 text-sm text-right max-w-xs font-mono">{value || '—'}</span>
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
        empresa: {
          razaoSocial: empresa.razaoSocial,
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          responsavel: empresa.responsavel,
        },
      })
      if (result.success) {
        setSavedOk(true)
        // Recarrega a aplicação para entrar no fluxo normal
        setTimeout(() => {
          window.location.reload()
        }, 1800)
      } else {
        setSaveError(result.error ?? 'Erro desconhecido ao salvar configuração.')
      }
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  if (savedOk) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-12 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-500 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-green-400" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Configuração concluída!</h2>
        <p className="text-gray-400 text-sm max-w-sm mb-4">
          O SudoSys foi configurado com sucesso. Iniciando o sistema…
        </p>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          Carregando…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full px-12 py-12">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">Revisão das configurações</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
          Verifique as configurações antes de iniciar o sistema. Você poderá alterá-las
          posteriormente nas configurações do sistema.
        </p>
      </div>

      {/* Resumo */}
      <div className="max-w-2xl space-y-6">
        {/* Banco de dados */}
        <div className="bg-surface-800 border border-surface-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">Banco de dados</p>
          </div>
          <InfoRow label="Tipo"       value={db.type === 'sqlite' ? 'SQLite local' : 'PostgreSQL externo'} />
          {db.type === 'postgres' && (
            <InfoRow label="Connection" value={db.connectionString.replace(/:[^:@]+@/, ':***@')} />
          )}
          {db.type === 'sqlite' && (
            <InfoRow label="Arquivo" value="{userData}/banco/sudosys.db" />
          )}
        </div>

        {/* Empresa */}
        <div className="bg-surface-800 border border-surface-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400">
                <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75v-2.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v2.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H4zm3-11a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 5.5zm.75 2.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 11.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm4.75-5.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zm-.75 4.25a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">Empresa</p>
          </div>
          <InfoRow label="Razão social"  value={empresa.razaoSocial} />
          <InfoRow label="CNPJ"          value={empresa.cnpj} />
          <InfoRow label="Endereço"      value={empresa.endereco} />
          <InfoRow label="Responsável"   value={empresa.responsavel} />
        </div>

        {/* Erro */}
        {saveError && (
          <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
            <p className="text-red-400 text-sm font-medium mb-1">Erro ao salvar configuração</p>
            <p className="text-red-400/70 text-xs font-mono">{saveError}</p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-auto pt-8 flex items-center justify-between border-t border-surface-500">
        <button
          onClick={prevStep}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-all duration-150 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <button
          onClick={handleStart}
          disabled={saving}
          className="
            flex items-center gap-3 px-8 py-3 rounded-lg
            bg-green-700 hover:bg-green-600
            text-white font-bold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-lg shadow-green-700/30
            transition-all duration-150 active:scale-95
          "
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando…
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Iniciar sistema
            </>
          )}
        </button>
      </div>
    </div>
  )
}
