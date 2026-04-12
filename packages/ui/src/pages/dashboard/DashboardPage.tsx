// packages/ui/src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { ipcClient } from '../../shared/ipcClient';
import { Database, Server } from 'lucide-react';

export function DashboardPage() {
  const [bancoInfo, setBancoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInfo() {
      try {
        const info = await ipcClient.banco.getInfo();
        setBancoInfo(info);
      } catch (err: any) {
        setError(err.message || 'Erro ao comunicar com o Backend.');
      }
    }
    loadInfo();
  }, []);

  return (
    <div className="container">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Bem-vindo ao SUDO SYS</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Status Card 1 */}
        <div className="card flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="text-primary" size={24} color="var(--color-primary)" />
            <h3 style={{ margin: 0 }}>IPC Backend</h3>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Status de Conexão</span>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'var(--color-success)', 
              color: 'white', 
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>Online</span>
          </div>
        </div>

        {/* Status Card 2 */}
        <div className="card flex-col gap-4">
          <div className="flex items-center gap-2">
            <Database className="text-primary" size={24} color="var(--color-primary)" />
            <h3 style={{ margin: 0 }}>Banco SQLite</h3>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {bancoInfo ? (
              <div className="flex-col gap-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Arquivo:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }} title={bancoInfo.dbFile}>
                    {bancoInfo.dbFile.split('\\\\').pop() || bancoInfo.dbFile}
                  </span>
                </div>
                <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Versão DB:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{bancoInfo.version}</span>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>Carregando informações do banco...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
