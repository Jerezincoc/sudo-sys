// packages/ui/src/pages/admin/UsersPage.tsx
import React, { useEffect, useState } from 'react';
import { ipcClient } from '../../shared/ipcClient';
import { ShieldAlert, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const resp = await ipcClient.users.list();
      setUsers(resp);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Gestão de Acessos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Controle quem pode acessar o SUDO SYS.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Nome</th>
              <th style={{ padding: '1rem' }}>E-mail</th>
              <th style={{ padding: '1rem' }}>Permissões</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{u.nome}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  {u.roles.map((r: string) => (
                    <span key={r} style={{ background: r === 'ADMIN' ? 'rgba(255, 68, 68, 0.1)' : 'var(--bg-primary)', color: r === 'ADMIN' ? 'var(--danger-color)' : 'var(--accent-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}>
                      {r}
                    </span>
                  ))}
                </td>
                <td style={{ padding: '1rem' }}>
                  {u.isActive ? <CheckCircle size={18} color="var(--success-color)" /> : <XCircle size={18} color="var(--danger-color)" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
