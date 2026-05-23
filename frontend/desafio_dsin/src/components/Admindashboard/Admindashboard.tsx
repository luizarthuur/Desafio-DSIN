import React, { useState, useEffect } from 'react';
import { relatorioSemanal } from '../../services/api';
import type { RelatorioSemanal } from '../../types';
import { FaChartLine, FaCalendarWeek } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await relatorioSemanal();
        setRelatorio(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: 'var(--color-plum)' }}><FaChartLine /> Painel Administrativo</h2>
      {relatorio && (
        <div className="card" style={{ background: 'var(--color-rose-light)', borderLeft: `6px solid var(--color-gold)` }}>
          <h3><FaCalendarWeek /> Desempenho da semana ({relatorio.semana.inicio} a {relatorio.semana.fim})</h3>
          <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginTop: 12 }}>
            <div><strong>Total agendamentos:</strong> {relatorio.totalAgendamentos}</div>
            <div><strong>Receita total:</strong> R$ {relatorio.receitaTotal.toFixed(2)}</div>
            <div><strong>Confirmados:</strong> {relatorio.confirmados}</div>
            <div><strong>Pendentes:</strong> {relatorio.pendentes}</div>
            <div><strong>Cancelamentos:</strong> {relatorio.cancelamentos}</div>
          </div>
          {relatorio.servicosMaisSolicitados.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>🔥 Serviços mais pedidos:</strong>
              <ul>
                {relatorio.servicosMaisSolicitados.map(s => (
                  <li key={s.nome}>{s.nome} – {s.quantidade} vez(es)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;