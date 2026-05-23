// frontend/src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { listarTodosAgendamentos, confirmarAgendamento, atualizarStatusItem, relatorioSemanal } from '../services/api';
import type { Agendamento, RelatorioSemanal } from '../types';
import { FaChartLine, FaCheckCircle, FaSpinner, FaCalendarWeek } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [agRes, relRes] = await Promise.all([
        listarTodosAgendamentos(),
        relatorioSemanal(),
      ]);
      setAgendamentos(agRes.data);
      setRelatorio(relRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleConfirmar = async (id: number) => {
    try {
      await confirmarAgendamento(id);
      // Recarrega sem recarregar a página
      setAgendamentos(prev =>
        prev.map(ag => ag.id === id ? { ...ag, status: 'confirmado' } : ag)
      );
    } catch (error) {
      alert('Erro ao confirmar agendamento');
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await atualizarStatusItem(itemId, newStatus);
      // Atualiza localmente
      setAgendamentos(prev =>
        prev.map(ag => ({
          ...ag,
          itens: ag.itens.map(item =>
            item.id === itemId ? { ...item, statusServico: newStatus as any } : item
          ),
        }))
      );
    } catch (error) {
      alert('Erro ao atualizar status do serviço');
    }
  };

  const formatarDataHora = (dataISO: string) => {
    const d = new Date(dataISO);
    return d.toLocaleString('pt-BR');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando dados...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: 'var(--color-plum)', marginBottom: 24 }}>
        <FaChartLine /> Painel Administrativo
      </h2>

      {/* Relatório semanal */}
      {relatorio && (
        <div className="card" style={{ marginBottom: 30, background: 'var(--color-rose-light)', borderLeft: `6px solid var(--color-gold)` }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCalendarWeek /> Desempenho da semana
          </h3>
          <p><strong>Período:</strong> {relatorio.semana.inicio} a {relatorio.semana.fim}</p>
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

      {/* Lista de todos os agendamentos */}
      <h3>📋 Todos os agendamentos</h3>
      {agendamentos.length === 0 && <p>Nenhum agendamento encontrado.</p>}
      {agendamentos.map(ag => (
        <div key={ag.id} className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
            <h4 style={{ margin: 0 }}>
              {ag.cliente.nome} – {formatarDataHora(ag.data)}
            </h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{
                background: ag.status === 'confirmado' ? '#d4edda' : '#fff3cd',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.8rem'
              }}>
                {ag.status}
              </span>
              {ag.status !== 'confirmado' && (
                <button onClick={() => handleConfirmar(ag.id)} style={{ padding: '4px 12px' }}>
                  <FaCheckCircle /> Confirmar
                </button>
              )}
            </div>
          </div>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {ag.itens.map(item => (
              <li key={item.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ flex: 2 }}><strong>{item.servico.nome}</strong> – R$ {item.precoNaHora.toFixed(2)}</span>
                <select
                  value={item.statusServico}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                  style={{ width: 'auto', marginBottom: 0, padding: '6px 12px' }}
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;