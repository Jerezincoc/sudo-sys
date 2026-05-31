import React, { useState, useEffect } from 'react'
import type { Usuario } from '@sudo-sys/shared'

type Section = 'usuarios' | 'logs' | 'tabelas' | 'backup'

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)

  // Tabelas
  const [counts, setCounts] = useState<{ [key: string]: number }>({})

  // Modal Novo Usuário
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState('operador')

  useEffect(() => {
    if (activeSection === 'usuarios') {
      loadUsuarios()
    } else if (activeSection === 'tabelas') {
      loadCounts()
    }
  }, [activeSection])

  async function loadUsuarios() {
    setLoading(true)
    try {
      const res = await window.electronAPI.listUsuarios()
      if (res.success) setUsuarios(res.data)
    } finally {
      setLoading(false)
    }
  }

  async function loadCounts() {
    setLoading(true)
    try {
      const [emp, func] = await Promise.all([
        window.electronAPI.listEmpresas(),
        window.electronAPI.listFuncionarios()
      ])
      setCounts({
        empresas: emp.length,
        funcionarios: func.length,
      })
    } catch {}
    setLoading(false)
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    const res = await window.electronAPI.createUsuario({ nome, email, senha, papel })
    if (res.success) {
      setShowModal(false)
      setNome(''); setEmail(''); setSenha(''); setPapel('operador')
      loadUsuarios()
    } else {
      alert(res.error)
    }
  }

  async function handleDeleteUser(id: number) {
    if (!confirm('Deseja realmente desativar este usuário?')) return
    const res = await window.electronAPI.deleteUsuario(id)
    if (res.success) loadUsuarios()
    else alert(res.error)
  }

  async function handleBackup() {
    const res = await window.electronAPI.backupDatabase()
    if (res.success) {
      alert('Backup realizado com sucesso: ' + res.data.filePath)
    } else {
      if (res.error !== 'Cancelado pelo usuário.') {
        alert('Erro no backup: ' + res.error)
      }
    }
  }

  const renderSidebarItem = (id: Section, label: string) => (
    <div
      onClick={() => setActiveSection(id)}
      style={{
        padding: '6px 12px',
        fontSize: 12,
        cursor: 'default',
        background: activeSection === id ? 'var(--color-bg-selected)' : 'transparent',
        color: activeSection === id ? '#fff' : 'var(--color-text-primary)',
      }}
    >
      {label}
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Menu Lateral (180px) ─────────────────────────────────────────── */}
      <div style={{
        width: 180,
        background: 'var(--color-bg-white)',
        borderRight: '1px solid var(--color-border-main)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid var(--color-border-light)' }}>
          Administração
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
          {renderSidebarItem('usuarios', 'Usuários')}
          {renderSidebarItem('logs', 'Logs de Auditoria')}
          {renderSidebarItem('tabelas', 'Tabelas Internas')}
          {renderSidebarItem('backup', 'Backup/Restore')}
        </div>
      </div>

      {/* ── Área de Conteúdo ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: 'var(--color-bg-main)' }}>
        
        {/* Seção Usuários */}
        {activeSection === 'usuarios' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>Gerenciamento de Usuários</div>
              <button onClick={() => setShowModal(true)} style={{ padding: '4px 8px', cursor: 'default' }}>+ Usuário</button>
            </div>

            <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 80px 80px 120px 80px', background: 'var(--color-bg-ribbon)', borderBottom: '2px solid var(--color-brand)', fontSize: 11, fontWeight: 700 }}>
                {['ID', 'Nome', 'Email', 'Papel', 'Status', 'Último Login', 'Ações'].map(h => (
                  <div key={h} style={{ padding: '4px' }}>{h}</div>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: 12, fontSize: 11 }}>Carregando...</div>
              ) : usuarios.map((u, i) => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 80px 80px 120px 80px', fontSize: 11, borderBottom: '1px solid var(--color-border-light)', background: i % 2 === 0 ? 'var(--color-bg-white)' : 'var(--color-bg-row-even)' }}>
                  <div style={{ padding: '4px' }}>{u.id}</div>
                  <div style={{ padding: '4px' }}>{u.nome}</div>
                  <div style={{ padding: '4px' }}>{u.email}</div>
                  <div style={{ padding: '4px' }}>{u.papel}</div>
                  <div style={{ padding: '4px' }}>{u.ativo ? 'Ativo' : 'Inativo'}</div>
                  <div style={{ padding: '4px' }}>{u.ultimo_login || '-'}</div>
                  <div style={{ padding: '4px' }}>
                    {u.ativo ? (
                      <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '2px 6px', fontSize: 10 }}>Excluir</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Logs */}
        {activeSection === 'logs' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Logs de Auditoria</div>
            <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--color-text-muted)' }}>Em desenvolvimento — logs de auditoria serão exibidos aqui</div>
            <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 150px 100px 1fr', background: 'var(--color-bg-ribbon)', borderBottom: '2px solid var(--color-brand)', fontSize: 11, fontWeight: 700 }}>
                {['Data', 'Usuário', 'Ação', 'Módulo', 'Detalhes'].map(h => (
                  <div key={h} style={{ padding: '4px' }}>{h}</div>
                ))}
              </div>
              <div style={{ padding: 12, fontSize: 11, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Nenhum log disponível.
              </div>
            </div>
          </div>
        )}

        {/* Seção Tabelas Internas */}
        {activeSection === 'tabelas' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Tabelas Internas</div>
            {loading ? <div style={{ fontSize: 11 }}>Carregando contagens...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { k: 'Empresas', v: counts.empresas ?? '-' },
                  { k: 'Funcionários', v: counts.funcionarios ?? '-' },
                  { k: 'Rubricas', v: '-' },
                  { k: 'Férias', v: '-' },
                  { k: 'Rescisões', v: '-' },
                  { k: 'Registros Ponto', v: '-' },
                  { k: 'Folhas', v: '-' },
                  { k: 'Usuários', v: usuarios.length > 0 ? usuarios.length : '-' }
                ].map(item => (
                  <div key={item.k} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{item.k}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--color-brand)' }}>{item.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção Backup */}
        {activeSection === 'backup' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Backup/Restore</div>
            <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)', padding: 16 }}>
              <div style={{ fontSize: 12, marginBottom: 16 }}>
                Gere um backup completo do banco de dados (sudosys.db) para um local seguro.
              </div>
              <button onClick={handleBackup} style={{ padding: '6px 12px', fontWeight: 'bold' }}>Fazer Backup</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Usuário */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)', padding: 16, width: 300, boxShadow: '2px 2px 5px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Novo Usuário</div>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>Nome</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', padding: 4 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 4 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>Senha</label>
                <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: 4 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>Papel</label>
                <select value={papel} onChange={e => setPapel(e.target.value)} style={{ width: '100%', padding: 4 }}>
                  <option value="admin">Administrador</option>
                  <option value="operador">Operador</option>
                  <option value="visualizador">Visualizador</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '4px 8px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '4px 8px', fontWeight: 'bold' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
