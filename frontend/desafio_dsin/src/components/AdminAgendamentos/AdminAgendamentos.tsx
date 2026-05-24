import React, { useState, useEffect } from 'react';
import { listarTodosAgendamentos, confirmarAgendamento } from '../../services/api';
import api from '../../services/api';
import type { Agendamento } from '../../types';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaTrash, FaCalendarAlt } from 'react-icons/fa';

const AdminAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [itemStatusMap, setItemStatusMap] = useState<{ [key: number]: string }>({});

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const res = await listarTodosAgendamentos();
      setAgendamentos(res.data);
    } catch (error) {
      setMensagem({ texto: 'Erro ao carregar agendamentos', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  useEffect(() => {
    if (selectedAgendamento) {
      const map: { [key: number]: string } = {};
      selectedAgendamento.itens.forEach(item => {
        map[item.id] = item.statusServico;
      });
      setItemStatusMap(map);
    } else {
      setItemStatusMap({});
    }
  }, [selectedAgendamento]);

  const getAgendamentosPorDia = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return agendamentos.filter(ag => {
      const agDate = new Date(ag.data);
      return agDate >= start && agDate <= end;
    });
  };

  const handleConfirmar = async (ag: Agendamento) => {
    try {
      await confirmarAgendamento(ag.id);
      setMensagem({ texto: `Agendamento de ${ag.cliente.nome} confirmado!`, tipo: 'sucesso' });
      carregarAgendamentos();
      setSelectedAgendamento(null);
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) {
      setMensagem({ texto: 'Erro ao confirmar', tipo: 'erro' });
    }
  };

  const handleCancelar = async () => {
    if (!selectedAgendamento) return;
    if (!motivoCancelamento.trim()) {
      setMensagem({ texto: 'Informe o motivo do cancelamento', tipo: 'erro' });
      return;
    }
    try {
      await api.patch(`/agendamentos/${selectedAgendamento.id}/cancelar`, { motivo: motivoCancelamento });
      setMensagem({ texto: `Agendamento de ${selectedAgendamento.cliente.nome} cancelado`, tipo: 'sucesso' });
      carregarAgendamentos();
      setSelectedAgendamento(null);
      setMotivoCancelamento('');
      setTimeout(() => setMensagem(null), 3000);
    } catch (error: any) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao cancelar', tipo: 'erro' });
    }
  };

  const handleSaveItemStatus = async (itemId: number, newStatus: string) => {
    try {
      await api.patch(`/agendamentos/itens/${itemId}/status`, { status: newStatus });
      setMensagem({ texto: 'Status do serviço atualizado!', tipo: 'sucesso' });
      setItemStatusMap(prev => ({ ...prev, [itemId]: newStatus }));
      carregarAgendamentos();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) {
      setMensagem({ texto: 'Erro ao atualizar status', tipo: 'erro' });
    }
  };

  const formatarHorario = (dataISO: string) => {
    const d = new Date(dataISO);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const semanaFormatada = () => {
    const inicio = weekDays[0];
    const fim = weekDays[6];
    return `${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`;
  };

  const semanaAnterior = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const proximaSemana = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const irParaSemana = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataEscolhida = new Date(e.target.value);
    if (!isNaN(dataEscolhida.getTime())) {
      setCurrentDate(dataEscolhida);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Carregando agenda...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>📅 Agenda do Salão</h2>

      {mensagem && (
        <div className="card" style={{ marginBottom: 20, backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fee', borderLeft: `4px solid ${mensagem.tipo === 'sucesso' ? 'green' : 'red'}` }}>
          {mensagem.texto}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={semanaAnterior} className="button" style={{ padding: '8px 16px' }}>
            <FaChevronLeft /> Semana anterior
          </button>
          <button onClick={proximaSemana} className="button" style={{ padding: '8px 16px' }}>
            Próxima semana <FaChevronRight />
          </button>
        </div>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{semanaFormatada()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCalendarAlt />
          <input type="date" onChange={irParaSemana} style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid var(--color-rose-light)' }} />
          <span style={{ fontSize: '0.8rem' }}>Ir para semana</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
        {weekDays.map(day => {
          const agendamentosDoDia = getAgendamentosPorDia(day);
          return (
            <div key={day.toISOString()} className="card" style={{ padding: 12, minHeight: 300 }}>
              <h3 style={{ textAlign: 'center', borderBottom: '1px solid var(--color-rose-light)', paddingBottom: 8 }}>
                {day.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </h3>
              <div style={{ marginTop: 12 }}>
                {agendamentosDoDia.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa' }}>Nenhum agendamento</p>
                ) : (
                  agendamentosDoDia.map(ag => (
                    <div
                      key={ag.id}
                      onClick={() => setSelectedAgendamento(ag)}
                      style={{
                        background: ag.status === 'cancelado' ? '#f8d7da' : (ag.status === 'confirmado' ? '#d4edda' : '#fff3cd'),
                        padding: 8,
                        marginBottom: 8,
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: '1px solid transparent'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <strong>{formatarHorario(ag.data)}</strong>
                      <div>{ag.cliente.nome}</div>
                      <small>{ag.itens.map(i => i.servico.nome).join(', ')}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAgendamento && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 600, background: 'white', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Detalhes do agendamento</h3>
            <p><strong>Cliente:</strong> {selectedAgendamento.cliente.nome}</p>
            <p><strong>Data/hora:</strong> {new Date(selectedAgendamento.data).toLocaleString('pt-BR')}</p>
            <p><strong>Status do agendamento:</strong> {selectedAgendamento.status}</p>

            <p style={{marginBottom: 15}}><strong>Serviços e status individual:</strong></p>
            {selectedAgendamento.itens.map(item => (
              <div key={item.id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                <div><strong>{item.servico.nome}</strong> – R$ {item.precoNaHora.toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <select
                    value={itemStatusMap[item.id] || item.statusServico}
                    onChange={e => setItemStatusMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                    style={{ width: 'auto' }}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                  <button onClick={() => handleSaveItemStatus(item.id, itemStatusMap[item.id])}>
                    Salvar status
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              {selectedAgendamento.status === 'pendente' && (
                <button onClick={() => handleConfirmar(selectedAgendamento)} style={{backgroundColor: 'green'}} className="button">
                  <FaCheckCircle /> Confirmar Agendamento
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
                {selectedAgendamento.status !== 'cancelado' && (
                  <>
                    <textarea
                      placeholder="Motivo do cancelamento (obrigatório)"
                      value={motivoCancelamento}
                      onChange={e => setMotivoCancelamento(e.target.value)}
                      rows={1}
                      style={{ flex: 1, minWidth: 150, resize: 'vertical' }}
                    />
                    <button onClick={handleCancelar} style={{ background: '#dc3545' }} className="button">
                      <FaTrash /> Cancelar
                    </button>
                  </>
                )}
                <button onClick={() => { setSelectedAgendamento(null); setMotivoCancelamento(''); }} className="button">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgendamentos;