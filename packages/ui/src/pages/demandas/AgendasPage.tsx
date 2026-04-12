// packages/ui/src/pages/demandas/AgendasPage.tsx
import React, { useState } from 'react';
import { ClipboardList, PlusCircle, AlertCircle } from 'lucide-react';

export function AgendasPage() {
  const [chamados, setChamados] = useState<any[]>([]);
  // Mock data ou busca inicial futuramente quando empresaId estiver contextual.

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={28} /> Demandas
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acompanhe chamados operacionais e pendências.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> Novo Chamado
        </button>
      </div>

      <div style={{ background: 'rgba(240, 173, 78, 0.1)', color: '#d97706', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(240, 173, 78, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={24} />
        <div>
          <strong>Sistema em construção</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Esta tela de demanda listará todas as solicitações vindas de usuários e os quadros de atendimento.</p>
        </div>
      </div>
    </div>
  );
}
