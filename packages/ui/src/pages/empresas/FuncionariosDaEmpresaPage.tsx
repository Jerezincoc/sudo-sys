// packages/ui/src/pages/empresas/FuncionariosDaEmpresaPage.tsx
import { useState } from 'react';
import type { Funcionario, Regime } from '@sudo-sys/domain';

// ─── Mock helpers (trocar por ipcClient depois) ──────────────────────────────
const formatMoney = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Badge A / B ─────────────────────────────────────────────────────────────
function RegimeBadge({ regime }: { regime: Regime }) {
  const isA = regime === 'A';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.5px', fontFamily: "'DM Mono', monospace",
      background: isA ? 'rgba(79,196,127,0.12)' : 'rgba(255,167,38,0.12)',
      color: isA ? '#4fc47f' : '#ffa726',
      border: `1px solid ${isA ? 'rgba(79,196,127,0.3)' : 'rgba(255,167,38,0.3)'}`,
    }}>
      {isA ? '●' : '○'} FOLHA {regime}
    </span>
  );
}

// ─── Form de funcionário ──────────────────────────────────────────────────────
interface FuncionarioFormProps {
  initial?: Partial<Funcionario>;
  empresaId: string;
  onSubmit: (data: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

function FuncionarioForm({ initial = {}, empresaId, onSubmit, onCancel, loading }: FuncionarioFormProps) {
  const [regime, setRegime] = useState<Regime>(initial.regime ?? 'A');
  const [nome, setNome] = useState(initial.nome ?? '');
  const [salario, setSalario] = useState(initial.salarioMensal ? String(initial.salarioMensal / 100) : '');
  const [salarioPorHora, setSalarioPorHora] = useState(initial.salarioPorHora ? String(initial.salarioPorHora / 100) : '');
  const [cargo, setCargo] = useState(initial.dadosClt?.cargo ?? '');
  const [cpf, setCpf] = useState(initial.dadosClt?.cpf ?? '');
  const [ctps, setCtps] = useState(initial.dadosClt?.ctps ?? '');
  const [pis, setPis] = useState(initial.dadosClt?.pis ?? '');
  const [admissao, setAdmissao] = useState(initial.dadosClt?.admissaoData ?? '');
  const [email, setEmail] = useState(initial.dadosClt?.emailPessoal ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isA = regime === 'A';

  function validate() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório';
    if (!salario || isNaN(Number(salario))) e.salario = 'Salário inválido';
    if (isA && cpf && !/^\d{11}$/.test(cpf.replace(/\D/g, ''))) e.cpf = 'CPF inválido';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const base: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'> = {
      empresaId,
      regime,
      nome: nome.trim(),
      salarioMensal: Math.round(Number(salario) * 100),
      salarioPorHora: salarioPorHora ? Math.round(Number(salarioPorHora) * 100) : 0,
      ativo: true,
    };

    if (isA) {
      base.dadosClt = {
        cargo: cargo || undefined,
        cpf: cpf || undefined,
        ctps: ctps || undefined,
        pis: pis || undefined,
        admissaoData: admissao || undefined,
        emailPessoal: email || undefined,
      };
    }

    onSubmit(base);
  }

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.formHeader}>
          <div>
            <h2 style={s.formTitle}>{initial.id ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
            <p style={s.formSub}>Escolha o regime antes de preencher</p>
          </div>
          {/* Toggle A/B */}
          <div style={s.toggleWrap}>
            {(['A', 'B'] as Regime[]).map(r => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                style={{
                  ...s.toggleBtn,
                  ...(regime === r ? (r === 'A' ? s.toggleActiveA : s.toggleActiveB) : {}),
                }}
              >
                Folha {r}
              </button>
            ))}
          </div>
        </div>

        {/* Regime hint */}
        <div style={{ ...s.hint, ...(isA ? s.hintA : s.hintB) }}>
          {isA
            ? '📋 Folha A — CLT oficial. Preencha todos os dados do colaborador para holerite completo, férias e rescisão legais.'
            : '🟡 Folha B — Informal / PJ / Avulso. Apenas nome e salário são obrigatórios. Sem encargos formais, mas os custos são estimados.'}
        </div>

        <div style={s.formBody}>
          {/* Campos comuns */}
          <div style={s.row}>
            <FField label="Nome completo *" error={errors.nome} style={{ flex: 2 }}>
              <input style={{ ...s.input, ...(errors.nome ? s.inputErr : {}) }}
                value={nome} onChange={e => { setNome(e.target.value); setErrors(p => ({ ...p, nome: '' })); }}
                placeholder="Nome do colaborador" />
            </FField>
            {isA && (
              <FField label="Cargo" error="" style={{ flex: 1 }}>
                <input style={s.input} value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Auxiliar" />
              </FField>
            )}
          </div>

          <div style={s.row}>
            <FField label="Salário mensal (R$) *" error={errors.salario} style={{ flex: 1 }}>
              <input style={{ ...s.input, ...(errors.salario ? s.inputErr : {}) }}
                type="number" min="0" step="0.01"
                value={salario} onChange={e => { setSalario(e.target.value); setErrors(p => ({ ...p, salario: '' })); }}
                placeholder="0,00" />
            </FField>
            <FField label="Valor/hora (R$)" error="" style={{ flex: 1 }}>
              <input style={s.input} type="number" min="0" step="0.01"
                value={salarioPorHora} onChange={e => setSalarioPorHora(e.target.value)}
                placeholder="Calculado automaticamente" />
            </FField>
          </div>

          {/* Campos exclusivos Folha A */}
          {isA && (
            <>
              <div style={s.divider}>
                <span style={s.dividerLabel}>Dados oficiais — Folha A</span>
              </div>

              <div style={s.row}>
                <FField label="CPF" error={errors.cpf} style={{ flex: 1 }}>
                  <input style={{ ...s.input, ...(errors.cpf ? s.inputErr : {}) }}
                    value={cpf} onChange={e => { setCpf(e.target.value); setErrors(p => ({ ...p, cpf: '' })); }}
                    placeholder="000.000.000-00" maxLength={14} />
                </FField>
                <FField label="PIS / PASEP" error="" style={{ flex: 1 }}>
                  <input style={s.input} value={pis} onChange={e => setPis(e.target.value)}
                    placeholder="000.00000.00-0" maxLength={14} />
                </FField>
              </div>

              <div style={s.row}>
                <FField label="CTPS nº" error="" style={{ flex: 1 }}>
                  <input style={s.input} value={ctps} onChange={e => setCtps(e.target.value)} placeholder="Número da carteira" />
                </FField>
                <FField label="Data de admissão" error="" style={{ flex: 1 }}>
                  <input style={s.input} type="date" value={admissao} onChange={e => setAdmissao(e.target.value)} />
                </FField>
              </div>

              <FField label="E-mail pessoal" error="">
                <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="funcionario@email.com" />
              </FField>
            </>
          )}
        </div>

        <div style={s.formFooter}>
          <button style={s.btnCancel} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...s.btnSubmit, ...(isA ? s.btnSubmitA : s.btnSubmitB) }}
          >
            {loading ? 'Salvando...' : initial.id ? 'Salvar' : `Cadastrar na Folha ${regime}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
interface PageProps {
  empresaId: string;
  empresaNome: string;
}

// Mock data — trocar por hook + ipcClient
const MOCK: Funcionario[] = [
  {
    id: '1', empresaId: 'e1', regime: 'A', nome: 'Ana Souza',
    salarioMensal: 350000, salarioPorHora: 0, ativo: true,
    dadosClt: { cargo: 'Gerente', cpf: '111.222.333-44', admissaoData: '2021-03-01' },
    createdAt: '', updatedAt: '',
  },
  {
    id: '2', empresaId: 'e1', regime: 'B', nome: 'Carlos Mendes (PJ)',
    salarioMensal: 500000, salarioPorHora: 0, ativo: true,
    createdAt: '', updatedAt: '',
  },
];

export function FuncionariosDaEmpresaPage({ empresaId, empresaNome }: PageProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(MOCK);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);
  const [filterRegime, setFilterRegime] = useState<Regime | 'ALL'>('ALL');

  const filtered = filterRegime === 'ALL'
    ? funcionarios
    : funcionarios.filter(f => f.regime === filterRegime);

  function handleSubmit(data: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editing) {
      setFuncionarios(fs => fs.map(f => f.id === editing.id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f));
    } else {
      const novo: Funcionario = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setFuncionarios(fs => [...fs, novo]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    setFuncionarios(fs => fs.filter(f => f.id !== id));
  }

  const totalA = funcionarios.filter(f => f.regime === 'A').length;
  const totalB = funcionarios.filter(f => f.regime === 'B').length;

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <p style={s.breadcrumb}>Empresas / {empresaNome}</p>
          <h1 style={s.pageTitle}>Colaboradores</h1>
        </div>
        <button style={s.btnNew} onClick={() => { setEditing(null); setShowForm(true); }}>
          + Novo colaborador
        </button>
      </div>

      {/* Stats */}
      <div style={s.stats}>
        <StatCard label="Total" value={funcionarios.length} color="#6c63ff" />
        <StatCard label="Folha A — CLT" value={totalA} color="#4fc47f" />
        <StatCard label="Folha B — Informal" value={totalB} color="#ffa726" />
      </div>

      {/* Filtros */}
      <div style={s.filters}>
        {(['ALL', 'A', 'B'] as const).map(r => (
          <button key={r}
            onClick={() => setFilterRegime(r)}
            style={{ ...s.filterBtn, ...(filterRegime === r ? s.filterActive : {}) }}
          >
            {r === 'ALL' ? 'Todos' : `Folha ${r}`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={s.list}>
        {filtered.length === 0 && (
          <div style={s.empty}>Nenhum colaborador encontrado.</div>
        )}
        {filtered.map(f => (
          <div key={f.id} style={s.row2}>
            <div style={s.avatar}>{f.nome[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={s.funcNome}>{f.nome}</div>
              <div style={s.funcSub}>
                {f.dadosClt?.cargo && <span>{f.dadosClt.cargo} · </span>}
                {formatMoney(f.salarioMensal)}/mês
                {f.dadosClt?.admissaoData && <span> · desde {f.dadosClt.admissaoData}</span>}
              </div>
            </div>
            <RegimeBadge regime={f.regime} />
            <div style={s.actions}>
              <button style={s.actionBtn} onClick={() => { setEditing(f); setShowForm(true); }}>✏️</button>
              <button style={{ ...s.actionBtn, color: '#e05560' }} onClick={() => handleDelete(f.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <FuncionarioForm
          initial={editing ?? {}}
          empresaId={empresaId}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...s.stat, borderColor: color + '33' }}>
      <span style={{ ...s.statVal, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

// ─── FField (Field para o form de func.) ─────────────────────────────────────
function FField({ label, error, children, style }: { label: string; error: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...{ marginBottom: 14 }, ...style }}>
      <label style={s.label}>{label}</label>
      {children}
      {error && <span style={s.errMsg}>{error}</span>}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px 40px', background: '#0d0d14', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#e2e2f0' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  breadcrumb: { margin: 0, fontSize: 12, color: '#5a5a78', marginBottom: 4 },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: '#e2e2f0' },
  btnNew: {
    padding: '10px 20px', borderRadius: 9, border: 'none',
    background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
    color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
    fontFamily: "'DM Sans', sans-serif",
  },
  stats: { display: 'flex', gap: 14, marginBottom: 24 },
  stat: {
    flex: 1, background: '#16161e', border: '1px solid', borderRadius: 10,
    padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4,
  },
  statVal: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#5a5a78', fontWeight: 500 },
  filters: { display: 'flex', gap: 8, marginBottom: 18 },
  filterBtn: {
    padding: '6px 16px', borderRadius: 99, border: '1px solid #2a2a38',
    background: 'transparent', color: '#9090a8', fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  filterActive: { background: '#6c63ff22', borderColor: '#6c63ff', color: '#a09bff' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row2: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#16161e', border: '1px solid #2a2a38',
    borderRadius: 10, padding: '14px 18px',
    transition: 'border-color .15s',
  },
  avatar: {
    width: 38, height: 38, borderRadius: 99,
    background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0,
  },
  funcNome: { fontWeight: 600, fontSize: 14, color: '#e2e2f0' },
  funcSub: { fontSize: 12, color: '#5a5a78', marginTop: 2 },
  actions: { display: 'flex', gap: 6 },
  actionBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 16, padding: '4px 6px', borderRadius: 6,
  },
  empty: { textAlign: 'center', color: '#5a5a78', padding: '48px 0', fontSize: 14 },

  // Form modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,10,14,0.78)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50, backdropFilter: 'blur(4px)',
  },
  card: {
    background: '#16161e', border: '1px solid #2a2a38', borderRadius: 16,
    width: '100%', maxWidth: 580,
    boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflow: 'hidden',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  },
  formHeader: {
    background: '#0e0e16', borderBottom: '1px solid #2a2a38',
    padding: '20px 28px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  formTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e2f0', letterSpacing: '-0.3px' },
  formSub: { margin: '3px 0 0', fontSize: 12, color: '#5a5a78' },
  toggleWrap: { display: 'flex', gap: 0, border: '1px solid #2a2a38', borderRadius: 8, overflow: 'hidden' },
  toggleBtn: {
    padding: '7px 18px', border: 'none', background: 'transparent',
    color: '#5a5a78', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", transition: 'all .15s',
  },
  toggleActiveA: { background: 'rgba(79,196,127,0.15)', color: '#4fc47f' },
  toggleActiveB: { background: 'rgba(255,167,38,0.15)', color: '#ffa726' },
  hint: {
    padding: '10px 28px', fontSize: 12, lineHeight: 1.6,
    borderBottom: '1px solid #2a2a38',
  },
  hintA: { background: 'rgba(79,196,127,0.06)', color: '#4fc47f' },
  hintB: { background: 'rgba(255,167,38,0.06)', color: '#ffa726' },
  formBody: { padding: '22px 28px 8px', overflowY: 'auto', flex: 1 },
  formFooter: {
    padding: '14px 28px 22px', display: 'flex',
    gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #2a2a38',
  },
  row: { display: 'flex', gap: 14 },
  divider: {
    margin: '10px 0 16px', borderTop: '1px solid #2a2a38',
    position: 'relative', textAlign: 'center',
  },
  dividerLabel: {
    position: 'relative', background: '#16161e',
    padding: '0 12px', fontSize: 11, color: '#4fc47f',
    fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  label: { display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: '#9090a8' },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: '#0e0e16', border: '1px solid #2a2a38',
    borderRadius: 8, padding: '9px 13px',
    color: '#e2e2f0', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  inputErr: { borderColor: '#e05560' },
  errMsg: { display: 'block', marginTop: 4, fontSize: 11, color: '#e05560' },
  btnCancel: {
    padding: '9px 20px', borderRadius: 8, border: '1px solid #2a2a38',
    background: 'transparent', color: '#9090a8', cursor: 'pointer', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  btnSubmit: {
    padding: '9px 22px', borderRadius: 8, border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
  },
  btnSubmitA: { background: 'linear-gradient(135deg,#3ecf6e,#22a05a)', boxShadow: '0 4px 14px rgba(62,207,110,0.3)' },
  btnSubmitB: { background: 'linear-gradient(135deg,#ffb74d,#e65100)', boxShadow: '0 4px 14px rgba(255,167,38,0.3)' },
};
