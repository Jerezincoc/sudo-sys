// packages/ui/src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { Shield } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      <div style={{ margin: 'auto', width: '400px', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'var(--accent-color)' }}>
          <Shield size={40} />
          <h1 style={{ marginLeft: '12px', fontSize: '1.5rem', color: 'var(--text-primary)' }}>SUDO SYS</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>E-mail</label>
            <input 
              type="email" 
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sudosys.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Senha</label>
            <input 
              type="password" 
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', height: '44px' }}>
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}
