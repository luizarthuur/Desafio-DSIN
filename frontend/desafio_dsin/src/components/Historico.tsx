import React, { useState } from 'react';
import { historicoCliente } from '../services/api';
import type { Agendamento } from '../types';

const Historico: React.FC = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const buscar = async () => {
    if (!dataInicio || !dataFim) return;
    try {
      const res = await historicoCliente(usuario.id, dataInicio, dataFim);
      setAgendamentos(res.data);
    } catch (error) {
      alert('Erro ao buscar histórico');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Histórico de Agendamentos</h2>
      <div>
        <label>Data Início:</label>
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        <label>Data Fim:</label>
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        <button onClick={buscar}>Buscar</button>
      </div>
      {agendamentos.length === 0 && <p>Nenhum agendamento encontrado.</p>}
      <ul>
        {agendamentos.map(ag => (
          <li key={ag.id}>
            <strong>{new Date(ag.data).toLocaleDateString('pt-BR')} às {new Date(ag.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong> - Status: {ag.status}
            <ul>
              {ag.itens.map(item => (
                <li key={item.id}>{item.servico.nome} - R$ {item.precoNaHora} ({item.statusServico})</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Historico;