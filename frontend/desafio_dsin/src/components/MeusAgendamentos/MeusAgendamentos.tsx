// src/components/MeusAgendamentos/MeusAgendamentos.tsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Agendamento } from '../../types';

const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const inicio = '2000-01-01';
      const fim = '2100-12-31';
      const res = await api.get(`/agendamentos/historico`, {
        params: { clienteId: usuario.id, dataInicio: inicio, dataFim: fim },
      });
      setAgendamentos(res.data);
    } catch (error) {
      console.error(error);
      setMensagem({ texto: 'Erro ao carregar agendamentos', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario.id) carregarAgendamentos();
  }, [usuario.id]);

  const podeModificar = (dataISO: string): boolean => {
    const hoje = new Date();
    const dataAgendamento = new Date(dataISO);
    const diffDias = Math.ceil((dataAgendamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 2;
  };

  const formatarData = (dataISO: string) => {
    const d = new Date(dataISO);
    return d.toLocaleDateString('pt-BR');
  };
  const formatarHora = (dataISO: string) => {
    const d = new Date(dataISO);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditar = (ag: Agendamento) => {
    setEditandoId(ag.id);
    const dataObj = new Date(ag.data);
    setNovaData(dataObj.toISOString().split('T')[0]);
    setNovaHora(dataObj.toTimeString().slice(0, 5));
  };

  const submitEdicao = async () => {
    if (!editandoId) return;
    try {
      await api.put(`/agendamentos/${editandoId}`, { novaData, novaHora, isAdmin: false });
      setMensagem({ texto: '✓ Agendamento alterado com sucesso!', tipo: 'sucesso' });
      setEditandoId(null);
      carregarAgendamentos();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error: any) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao alterar', tipo: 'erro' });
    }
  };

  const handleCancelar = (id: number) => {
    setCancelandoId(id);
    setMotivoCancelamento('');
  };

  const submitCancelamento = async () => {
    if (!cancelandoId) return;
    if (!motivoCancelamento.trim()) {
      setMensagem({ texto: 'Informe o motivo do cancelamento', tipo: 'erro' });
      return;
    }
    try {
      await api.patch(`/agendamentos/${cancelandoId}/cancelar`, { motivo: motivoCancelamento });
      setMensagem({ texto: '✓ Agendamento cancelado', tipo: 'sucesso' });
      setCancelandoId(null);
      carregarAgendamentos();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error: any) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao cancelar', tipo: 'erro' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Carregando seus agendamentos...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: 'var(--color-plum)', marginBottom: 24 }}>Meus Agendamentos</h2>

      {mensagem && (
        <div className="card" style={{
          textAlign: 'center',
          marginBottom: 20,
          backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fee',
          borderLeft: `4px solid ${mensagem.tipo === 'sucesso' ? 'green' : 'red'}`
        }}>
          {mensagem.texto}
        </div>
      )}

      {agendamentos.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Nenhum agendamento encontrado.</p>
        </div>
      )}

      {agendamentos.map(ag => {
        const pode = podeModificar(ag.data);
        return (
          <div key={ag.id} className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>
                {formatarData(ag.data)} às {formatarHora(ag.data)}
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

            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 16 }}>
              {ag.itens.map(item => (
                <li key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-rose-light)' }}>
                  <strong>{item.servico.nome}</strong> – R$ {item.precoNaHora.toFixed(2)}
                  <span style={{ marginLeft: 12, fontSize: '0.8rem', background: 'var(--color-nude)', padding: '2px 8px', borderRadius: 12 }}>
                    {item.statusServico}
                  </span>
                </li>
              ))}
            </ul>

            {ag.motivoCancelamento && (
              <p style={{ fontSize: '0.85rem', color: '#555', marginTop: 8 }}>
                <strong>Motivo do cancelamento:</strong> {ag.motivoCancelamento}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {ag.status !== 'cancelado' && (
                <>
                  {pode ? (
                    <button className="button" onClick={() => handleEditar(ag)}>
                       Alterar data/hora
                    </button>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.8rem', alignSelf: 'center' }}>
                       Alteração permitida apenas com 2 dias ou mais de antecedência. Ligue para o salão.
                    </span>
                  )}
                  {pode ? (
                    <button onClick={() => handleCancelar(ag.id)} style={{ background: '#dc3545' }} className="button">
                      Cancelar
                    </button>
                  ) : (
                    <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }} className="button">
                      Cancelamento indisponível
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal de edição */}
      {editandoId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 400, background: 'white' }}>
            <h3 style={{ marginBottom: 16 }}>Alterar agendamento</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Nova data</label>
              <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Novo horário</label>
              <input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="button" onClick={submitEdicao}>Salvar</button>
              <button className="button" onClick={() => setEditandoId(null)} style={{ background: '#aaa' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelamento */}
      {cancelandoId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 400, background: 'white' }}>
            <h3 style={{ marginBottom: 16 }}>Cancelar agendamento</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Motivo do cancelamento</label>
              <textarea
                value={motivoCancelamento}
                onChange={e => setMotivoCancelamento(e.target.value)}
                rows={3}
                style={{ width: '100%' }}
                placeholder="Explique o motivo..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={submitCancelamento} style={{ background: '#dc3545' }} className="button">
                Confirmar cancelamento
              </button>
              <button className="button" onClick={() => setCancelandoId(null)} style={{ background: '#aaa' }}>Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeusAgendamentos;