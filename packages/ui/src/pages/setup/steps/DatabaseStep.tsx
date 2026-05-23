import React from 'react'
import { useWizardStore } from '@/state/wizardStore'
import { ipcClient } from '@/api/ipcClient'

function StatusBadge({ status }: { status: string }) {
  if (status === 'idle')    return null
  if (status === 'testing') return (
    <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
      <span className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
      Testando conexão…
    </span>
  )
  if (status === 'ok') return (
    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
      Conexão estabelecida com sucesso
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      Falha na conexão
    </span>
  )
}

export default function DatabaseStep() {
  const { db, setDbType, setConnectionString, setDbTestStatus, nextStep, prevStep } = useWizardStore()

  const canProceed =
    db.type === 'sqlite' ||
    (db.type === 'postgres' && db.testStatus === 'ok')

  async function handleTest() {
    if (db.type === 'postgres' && !db.connectionString.trim()) return
    setDbTestStatus('testing')
    try {
      const result = await ipcClient.testDatabase({
        type: db.type,
        connectionString: db.type === 'postgres' ? db.connectionString : undefined,
      })
      if (result.success) {
        setDbTestStatus('ok', null, result.latencyMs ?? null)
      } else {
        setDbTestStatus('error', result.error ?? 'Falha desconhecida')
      }
    } catch (err) {
      setDbTestStatus('error', String(err))
    }
  }

  return (
    <div className="flex flex-col min-h-full px-12 py-12">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">Banco de dados</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
          Escolha onde os dados do sistema serão armazenados. Para a maioria das instalações,
          o SQLite local é a opção recomendada — sem configuração adicional.
        </p>
      </div>

      {/* Opções */}
      <div className="space-y-4 mb-8 max-w-2xl">
        {/* SQLite */}
        <button
          onClick={() => setDbType('sqlite')}
          className={[
            'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group',
            db.type === 'sqlite'
              ? 'border-brand-600 bg-brand-600/10'
              : 'border-surface-500 bg-surface-800 hover:border-surface-400',
          ].join(' ')}
        >
          <div className="flex items-start gap-4">
            {/* Radio */}
            <div className={[
              'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
              db.type === 'sqlite' ? 'border-brand-500' : 'border-surface-400 group-hover:border-surface-300',
            ].join(' ')}>
              {db.type === 'sqlite' && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold text-sm">SQLite local</p>
                <span className="px-2 py-0.5 bg-brand-600/20 text-brand-400 text-xs font-medium rounded-full border border-brand-600/30">
                  Recomendado
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Banco de dados embutido, armazenado como arquivo local. Zero configuração,
                backup simples, ideal para uso em uma estação de trabalho.
              </p>
              {db.type === 'sqlite' && (
                <div className="mt-3 px-3 py-2 bg-surface-700 rounded-lg">
                  <p className="text-gray-400 text-xs font-mono">
                    📁 {'{userData}'}/banco/sudosys.db
                  </p>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* PostgreSQL */}
        <button
          onClick={() => setDbType('postgres')}
          className={[
            'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group',
            db.type === 'postgres'
              ? 'border-brand-600 bg-brand-600/10'
              : 'border-surface-500 bg-surface-800 hover:border-surface-400',
          ].join(' ')}
        >
          <div className="flex items-start gap-4">
            <div className={[
              'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
              db.type === 'postgres' ? 'border-brand-500' : 'border-surface-400 group-hover:border-surface-300',
            ].join(' ')}>
              {db.type === 'postgres' && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">PostgreSQL externo</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Conecta a um servidor PostgreSQL existente. Indicado para ambientes
                multi-usuário ou quando há infraestrutura de banco já disponível.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Connection string (só PostgreSQL) */}
      {db.type === 'postgres' && (
        <div className="max-w-2xl mb-6 space-y-3 animate-in fade-in duration-200">
          <label className="block">
            <span className="text-gray-300 text-sm font-medium mb-1.5 block">
              Connection String
            </span>
            <input
              type="text"
              value={db.connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://usuario:senha@host:5432/banco"
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-700 border border-surface-500
                text-white placeholder-gray-600 text-sm font-mono
                focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/50
                transition-colors duration-150
              "
            />
          </label>
          <p className="text-gray-600 text-xs">
            Exemplo: <code className="text-gray-500">postgresql://admin:senha@localhost:5432/sudosys_db</code>
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleTest}
              disabled={!db.connectionString.trim() || db.testStatus === 'testing'}
              className="
                flex items-center gap-2 px-5 py-2 rounded-lg
                bg-surface-700 hover:bg-surface-600
                border border-surface-500 hover:border-surface-400
                text-sm text-gray-300 font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              {db.testStatus === 'testing' ? (
                <span className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                </svg>
              )}
              Testar conexão
            </button>
            <StatusBadge status={db.testStatus} />
          </div>

          {db.testStatus === 'error' && db.testError && (
            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
              <p className="text-red-400 text-xs font-mono">{db.testError}</p>
            </div>
          )}

          {db.testStatus === 'ok' && db.latencyMs !== null && (
            <p className="text-green-500/70 text-xs">
              Latência: {db.latencyMs}ms
            </p>
          )}
        </div>
      )}

      {/* SQLite: botão de teste opcional */}
      {db.type === 'sqlite' && (
        <div className="max-w-2xl mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleTest}
              disabled={db.testStatus === 'testing'}
              className="
                flex items-center gap-2 px-5 py-2 rounded-lg
                bg-surface-700 hover:bg-surface-600
                border border-surface-500 hover:border-surface-400
                text-sm text-gray-300 font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              Verificar permissões de escrita
            </button>
            <StatusBadge status={db.testStatus} />
          </div>
        </div>
      )}

      {/* Rodapé navegação */}
      <div className="mt-auto pt-8 flex items-center justify-between border-t border-surface-500">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-all duration-150 text-sm font-medium"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="
            flex items-center gap-2 px-7 py-2.5 rounded-lg
            bg-brand-600 hover:bg-brand-500
            text-white font-semibold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-lg shadow-brand-600/30
            transition-all duration-150
            active:scale-95
          "
        >
          Próximo
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
