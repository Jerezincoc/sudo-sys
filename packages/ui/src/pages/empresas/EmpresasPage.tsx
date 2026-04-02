// packages/ui/src/pages/empresas/EmpresasPage.tsx
import { useState, useEffect } from 'react';
import { empresaClient } from '../../api/ipcClient';
import { EmpresaForm } from './EmpresaForm';
import type { EmpresaDTO, CreateEmpresaDTO, UpdateEmpresaDTO } from '@sudo-sys/application';

interface Props {
  onSelectEmpresa?: (empresa: EmpresaDTO) => void;
}

export function EmpresasPage({ onSelectEmpresa }: Props) {
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<EmpresaDTO | null>(null);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    empresaClient.list()
      .then(setEmpresas)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data: CreateEmpresaDTO) {
    setSaving(true);
    try {
      if (editing) {
        const updated = await empresaClient.update({ ...data, id: editing.id } as UpdateEmpresaDTO);
        setEmpresas(es => es.map(e => e.id === updated.id ? updated : e));
      } else {
        const nova = await empresaClient.create(data);
        setEmpresas(es => [...es, nova]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover empresa? Todos os dados serão desativados.')) return;
    await empresaClient.delete(id);
    setEmpresas(es => es.filter(e => e.id !== id));
  }

  const filtered = empresas.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.fantasia ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topbar}>
        <div>
          <h1 style={s.pageTitle}>Empresas</h1>
          <p style={s.pageSub}>{empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.btnNew} onClick={() => { setEditing(null); setShowForm(true); }}>
          + Nova empresa
        </button>
      </div>

      {/* Busca */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Buscar por nome ou fantasia..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Estado */}
      {loading && <div style={s.state}>Carregando...</div>}
      {error   && <div style={{ ...s.state, color: '#e05560' }}>{error}</div>}

      {/* Grid de empresas */}
      {!loading && (
        <div style={s.grid}>
          {filtered.length === 0 && (
            <div style={s.empty}>
              {search ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa cadastrada ainda. Crie a primeira!'}
            </div>
          )}
          {filtered.map(empresa => (
            <div key={empresa.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.cardAvatar}>
                  {(empresa.fantasia ?? empresa.nome)[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.cardNome}>{empresa.fantasia ?? empresa.nome}</div>
                  {empresa.fantasia && (
                    <div style={s.cardRazao}>{empresa.nome}</div>
                  )}
                  {empresa.cnpj && (
                    <div style={s.cardCnpj}>CNPJ {empresa.cnpj}</div>
                  )}
                </div>
              </div>

              {empresa.endereco && (
                <div style={s.cardEndereco}>📍 {empresa.endereco}</div>
              )}

              <div style={s.cardFooter}>
                <button
                  style={s.btnFuncionarios}
                  onClick={() => onSelectEmpresa?.(empresa)}
                >
                  👥 Colaboradores
                </button>
                <div style={s.cardActions}>
                  <button style={s.iconBtn} onClick={() => { setEditing(empresa); setShowForm(true); }}>✏️</button>
                  <button style={{ ...s.iconBtn, color: '#e05560' }} onClick={() => handleDelete(empresa.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EmpresaForm
          initial={editing ?? {}}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:       { padding: '32px 40px', background: '#0d0d14', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#e2e2f0' },
  topbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle:  { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  pageSub:    { margin: '4px 0 0', fontSize: 13, color: '#5a5a78' },
  btnNew: {
    padding: '10px 20px', borderRadius: 9, border: 'none',
    background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
    color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
    fontFamily: "'DM Sans', sans-serif",
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#16161e', border: '1px solid #2a2a38',
    borderRadius: 10, padding: '10px 16px', marginBottom: 24,
  },
  searchIcon:  { fontSize: 14, color: '#5a5a78' },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#e2e2f0', fontSize: 14, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  state: { textAlign: 'center', padding: '48px 0', color: '#5a5a78', fontSize: 14 },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: '#5a5a78', fontSize: 14 },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: {
    background: '#16161e', border: '1px solid #2a2a38', borderRadius: 12,
    padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'border-color .15s',
  },
  cardTop:    { display: 'flex', gap: 14, alignItems: 'flex-start' },
  cardAvatar: {
    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 18, color: '#fff',
  },
  cardNome:    { fontSize: 15, fontWeight: 700, color: '#e2e2f0' },
  cardRazao:   { fontSize: 12, color: '#5a5a78', marginTop: 2 },
  cardCnpj:    { fontSize: 11, color: '#9090a8', marginTop: 4, fontFamily: "'DM Mono', monospace" },
  cardEndereco:{ fontSize: 12, color: '#5a5a78' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  btnFuncionarios: {
    padding: '7px 14px', borderRadius: 8,
    border: '1px solid #2a2a38', background: 'transparent',
    color: '#9090a8', fontSize: 12, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all .15s',
  },
  cardActions: { display: 'flex', gap: 4 },
  iconBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 15, padding: '4px 6px', borderRadius: 6,
  },
};
