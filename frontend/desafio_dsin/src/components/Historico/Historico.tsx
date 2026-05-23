// frontend/src/components/Historico.tsx
import React, { useState } from 'react';
import { historicoCliente } from '../services/api';
import type { Agendamento } from '../types';
import { FaCalendarAlt, FaClock, FaListAlt } from 'react-icons/fa';

const Historico: React.FC = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const buscar = async () => {
    if (!dataInicio || !dataFim) {
      alert('Preencha ambas as datas');
      return;
    }
    setLoading(true);
    try {
      const res = await historicoCliente(usuario.id, dataInicio, dataFim);
      setAgendamentos(res.data);
      setBuscou(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar histórico');
    } finally {
      setLoading(false);
    }
  };

  const formatarDataHora = (dataISO: string) => {
    const d = new Date(dataISO);
    return {
      data: d.toLocaleDateString('pt-BR'),
      hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <div className="card" style={{ marginBottom: 30 }}>
        <h2 style={{ color: 'var(--color-plum)' }}>
          <FaListAlt style={{ marginRight: 8 }} /> Meu Histórico
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Data Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <button onClick={buscar} disabled={loading} style={{ marginBottom: 15 }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {buscou && agendamentos.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Nenhum agendamento encontrado neste período.</p>
        </div>
      )}

      {agendamentos.map(ag => {
        const { data, hora } = formatarDataHora(ag.data);
        return (
          <div key={ag.id} className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
              <h3 style={{ color: 'var(--color-plum)' }}>
                <FaCalendarAlt style={{ marginRight: 6 }} /> {data} às {hora}
              </h3>
              <span style={{
                background: ag.status === 'confirmado' ? '#d4edda' : ag.status === 'cancelado' ? '#f8d7da' : '#fff3cd',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: ag.status === 'confirmado' ? '#155724' : ag.status === 'cancelado' ? '#721c24' : '#856404'
              }}>
                {ag.status.toUpperCase()}
              </span>
            </div>
            <p><strong>Cliente:</strong> {ag.cliente.nome}</p>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {ag.itens.map(item => (
                <li key={item.id} style={{ marginBottom: 8, borderBottom: '1px solid var(--color-rose-light)', paddingBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{item.servico.nome}</span> – R$ {item.precoNaHora.toFixed(2)}
                  <span style={{ marginLeft: 12, fontSize: '0.8rem', background: 'var(--color-nude)', padding: '2px 8px', borderRadius: 12 }}>
                    {item.statusServico}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Historico;