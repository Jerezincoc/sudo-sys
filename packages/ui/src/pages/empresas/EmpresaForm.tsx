// packages/ui/src/pages/empresas/EmpresaForm.tsx
import { useState } from 'react';
import type { Empresa } from '@sudo-sys/domain';

interface Props {
  initial?: Partial<Empresa>;
  onSubmit: (data: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EmpresaForm({ initial = {}, onSubmit, onCancel, loading }: Props) {
  const [nome, setNome] = useState(initial.nome ?? '');
  const [cnpj, setCnpj] = useState(initial.cnpj ?? '');
  const [fantasia, setFantasia] = useState(initial.fantasia ?? '');
  const [endereco, setEndereco] = useState(initial.endereco ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório';
    if (cnpj && !/^\d{14}$/.test(cnpj.replace(/\D/g, '')))
      e.cnpj = 'CNPJ inválido';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ nome: nome.trim(), cnpj: cnpj || undefined, fantasia: fantasia || undefined, endereco: endereco || undefined });
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.headerIcon}>🏢</span>
          <h2 style={styles.title}>{initial.id ? 'Editar Empresa' : 'Nova Empresa'}</h2>
        </div>

        <div style={styles.body}>
          <Field label="Razão Social *" error={errors.nome}>
            <input
              style={{ ...styles.input, ...(errors.nome ? styles.inputError : {}) }}
              value={nome}
              onChange={e => { setNome(e.target.value); setErrors(p => ({ ...p, nome: '' })); }}
              placeholder="Ex: João Silva LTDA"
            />
          </Field>

          <Field label="Nome Fantasia" error="">
            <input
              style={styles.input}
              value={fantasia}
              onChange={e => setFantasia(e.target.value)}
              placeholder="Ex: João & Filhos"
            />
          </Field>

          <Field label="CNPJ" error={errors.cnpj}>
            <input
              style={{ ...styles.input, ...(errors.cnpj ? styles.inputError : {}) }}
              value={cnpj}
              onChange={e => { setCnpj(e.target.value); setErrors(p => ({ ...p, cnpj: '' })); }}
              placeholder="00.000.000/0001-00 (opcional)"
              maxLength={18}
            />
          </Field>

          <Field label="Endereço" error="">
            <input
              style={styles.input}
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Rua, número, cidade..."
            />
          </Field>
        </div>

        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : initial.id ? 'Salvar alterações' : 'Criar empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field helper ───────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(10,10,14,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: '#16161e',
    border: '1px solid #2a2a38',
    borderRadius: 14,
    width: '100%', maxWidth: 480,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg,#1e1e2e 0%,#12121a 100%)',
    borderBottom: '1px solid #2a2a38',
    padding: '20px 28px',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  headerIcon: { fontSize: 22 },
  title: {
    margin: 0, fontSize: 18, fontWeight: 700,
    color: '#e2e2f0', letterSpacing: '-0.3px',
    fontFamily: "'DM Sans', sans-serif",
  },
  body: { padding: '24px 28px 8px' },
  footer: {
    padding: '16px 28px 24px',
    display: 'flex', gap: 10, justifyContent: 'flex-end',
  },
  label: {
    display: 'block', marginBottom: 6,
    fontSize: 13, fontWeight: 500, color: '#9090a8',
    fontFamily: "'DM Sans', sans-serif",
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: '#0e0e16', border: '1px solid #2a2a38',
    borderRadius: 8, padding: '10px 14px',
    color: '#e2e2f0', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color .15s',
  },
  inputError: { borderColor: '#e05560' },
  errorMsg: { display: 'block', marginTop: 5, fontSize: 12, color: '#e05560' },
  btnCancel: {
    padding: '9px 20px', borderRadius: 8, border: '1px solid #2a2a38',
    background: 'transparent', color: '#9090a8', cursor: 'pointer', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  btnSubmit: {
    padding: '9px 22px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
  },
};
