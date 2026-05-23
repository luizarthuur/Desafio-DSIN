import React, { useState, useEffect } from 'react';
import { listarTodosAgendamentos, confirmarAgendamento } from '../../services/api';
import api from '../../services/api';
import type { Agendamento } from '../../types';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaTrash, FaCheckCircle } from 'react-icons/fa';

const AdminAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // Calcula o início da semana (domingo) e os dias da semana
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = domingo
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
      console.error(error);
      setMensagem({ texto: 'Erro ao carregar agendamentos', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  // Filtra agendamentos do dia específico
  const getAgendamentosPorDia = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return agendamentos.filter(ag => {
      const agDate = new Date(ag.data);
      return agDate >= startOfDay && agDate <= endOfDay;
    });
  };

  const handleConfirmar = async (ag: Agendamento) => {
    try {
      await confirmarAgendamento(ag.id);
      setMensagem({ texto: `Agendamento de ${ag.cliente.nome} confirmado!`, tipo: 'sucesso' });
      carregarAgendamentos();
      setSelectedAgendamento(null);
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
    } catch (error: any) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao cancelar', tipo: 'erro' });
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

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Carregando agenda...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>📅 Agenda do Salão</h2>

      {mensagem && (
        <div className="card" style={{
          marginBottom: 20,
          backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fee',
          borderLeft: `4px solid ${mensagem.tipo === 'sucesso' ? 'green' : 'red'}`
        }}>
          {mensagem.texto}
        </div>
      )}

      {/* Controles de navegação da semana */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={semanaAnterior} className="button" style={{ padding: '8px 16px' }}>
          <FaChevronLeft /> Semana anterior
        </button>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{semanaFormatada()}</span>
        <button onClick={proximaSemana} className="button" style={{ padding: '8px 16px' }}>
          Próxima semana <FaChevronRight />
        </button>
      </div>

      {/* Grade semanal */}
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
                        transition: '0.2s',
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

      {/* Modal de detalhes / ações */}
{/* Modal de detalhes / ações */}
{selectedAgendamento && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)'
  }}>
    <div className="card" style={{
      width: 550,
      maxWidth: '90vw',
      maxHeight: '85vh',
      overflowY: 'auto',
      background: 'white',
      padding: 0,
      borderRadius: 24,
      boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Cabeçalho com cor de fundo conforme status */}
      <div style={{
        background: selectedAgendamento.status === 'confirmado' ? '#d4edda' : (selectedAgendamento.status === 'cancelado' ? '#f8d7da' : 'var(--color-rose-light)'),
        padding: '20px 24px',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottom: '1px solid var(--color-rose-light)'
      }}>
        <h3 style={{ margin: 0, color: 'var(--color-plum)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCalendarAlt /> Detalhes do Agendamento
        </h3>
        <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#555' }}>
          ID #{selectedAgendamento.id} • {new Date(selectedAgendamento.data).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Corpo do modal */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 16 }}>
          <div><strong>Cliente:</strong> {selectedAgendamento.cliente.nome}</div>
          <div><strong>Data/Hora:</strong> {new Date(selectedAgendamento.data).toLocaleString('pt-BR')}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>Serviços contratados:</strong>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {selectedAgendamento.itens.map(item => (
              <li key={item.id} style={{ marginBottom: 4 }}>
                {item.servico.nome} – R$ {item.precoNaHora.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: 20 }}>
          <strong>Status atual:</strong>{' '}
          <span style={{
            background: selectedAgendamento.status === 'confirmado' ? '#d4edda' : (selectedAgendamento.status === 'cancelado' ? '#f8d7da' : '#fff3cd'),
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: selectedAgendamento.status === 'confirmado' ? '#155724' : (selectedAgendamento.status === 'cancelado' ? '#721c24' : '#856404')
          }}>
            {selectedAgendamento.status.toUpperCase()}
          </span>
        </div>

        {/* Ações */}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--color-rose-light)', paddingTop: 20 }}>
          {selectedAgendamento.status === 'pendente' && (
            <button onClick={() => handleConfirmar(selectedAgendamento)} className="button" style={{ marginRight: 12 }}>
              <FaCheckCircle /> Confirmar Agendamento
            </button>
          )}
          {selectedAgendamento.status !== 'cancelado' && (
            <>
              <textarea
                placeholder="Motivo do cancelamento (obrigatório)"
                value={motivoCancelamento}
                onChange={e => setMotivoCancelamento(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 12,
                  border: '1px solid var(--color-rose-light)',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <button onClick={handleCancelar} style={{ background: '#dc3545', marginRight: 12 }} className="button">
                <FaTrash /> Cancelar Agendamento
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