import React, { useState, useEffect } from 'react';
import { listarTodosAgendamentos, confirmarAgendamento, atualizarStatusItem, relatorioSemanal } from '../services/api';
import type { Agendamento, RelatorioSemanal } from '../types';

const AdminDashboard: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);

  const carregarAgendamentos = async () => {
    const res = await listarTodosAgendamentos();
    setAgendamentos(res.data);
  };

  const carregarRelatorio = async () => {
    const res = await relatorioSemanal();
    setRelatorio(res.data);
  };

  const handleConfirmar = async (id: number) => {
    await confirmarAgendamento(id);
    carregarAgendamentos();
  };

  const handleStatusChange = async (itemId: number, status: string) => {
    await atualizarStatusItem(itemId, status);
    carregarAgendamentos();
  };

  useEffect(() => {
    carregarAgendamentos();
    carregarRelatorio();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Painel Administrativo</h2>
      {relatorio && (
        <div>
          <h3>Desempenho da semana ({relatorio.semana.inicio} a {relatorio.semana.fim})</h3>
          <p>Total agendamentos: {relatorio.totalAgendamentos}</p>
          <p>Receita total: R$ {relatorio.receitaTotal}</p>
          <p>Confirmados: {relatorio.confirmados} | Pendentes: {relatorio.pendentes}</p>
          <p>Top serviços: {relatorio.servicosMaisSolicitados.map(s => `${s.nome} (${s.quantidade})`).join(', ')}</p>
        </div>
      )}
      <h3>Todos os agendamentos</h3>
      {agendamentos.map(ag => (
        <div key={ag.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <p><strong>Cliente:</strong> {ag.cliente.nome} - Data: {new Date(ag.data).toLocaleString()}</p>
          <p>Status: {ag.status} <button onClick={() => handleConfirmar(ag.id)}>Confirmar</button></p>
          <ul>
            {ag.itens.map(item => (
              <li key={item.id}>
                {item.servico.nome} - R$ {item.precoNaHora} - Status: {item.statusServico}
                <select onChange={(e) => handleStatusChange(item.id, e.target.value)} defaultValue={item.statusServico}>
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