import React, { useState } from 'react';
import api from '../../services/api';
import type { Agendamento } from '../../types';

const MeusAgendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const carregarAgendamentos = async () => {
    if (!dataInicio || !dataFim) {
      setMensagem({ texto: 'Selecione as datas de início e fim.', tipo: 'erro' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/agendamentos/historico`, {
        params: { clienteId: usuario.id, dataInicio, dataFim },
      });
      setAgendamentos(res.data);
      setFiltroAplicado(true);
    } catch (error) {
      setMensagem({ texto: 'Erro ao carregar agendamentos', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  const limparFiltro = () => {
    setDataInicio('');
    setDataFim('');
    setFiltroAplicado(false);
    setAgendamentos([]);
  };

  const podeModificar = (dataISO: string): boolean => {
    const hoje = new Date();
    const dataAgendamento = new Date(dataISO);
    const diffDias = Math.ceil((dataAgendamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 2;
  };

  const formatarData = (dataISO: string) => new Date(dataISO).toLocaleDateString('pt-BR');
  const formatarHora = (dataISO: string) => new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
      setMensagem({ texto: '✓ Agendamento alterado!', tipo: 'sucesso' });
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

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>📋 Meus Agendamentos</h2>
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Data Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <button onClick={carregarAgendamentos} className="button">Filtrar</button>
          <button onClick={limparFiltro} style={{ background: '#6c757d' }}>Limpar</button>
        </div>
      </div>

      {mensagem && (
        <div className="card" style={{ marginBottom: 20, backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fee', borderLeft: `4px solid ${mensagem.tipo === 'sucesso' ? 'green' : 'red'}` }}>
          {mensagem.texto}
        </div>
      )}

      {loading && <p>Carregando...</p>}
      {filtroAplicado && !loading && agendamentos.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>Nenhum agendamento encontrado.</div>
      )}

      {agendamentos.map(ag => {
        const pode = podeModificar(ag.data);
        return (
          <div key={ag.id} className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
              <h3>{formatarData(ag.data)} às {formatarHora(ag.data)}</h3>
              <span style={{
                background: ag.status === 'confirmado' ? '#d4edda' : ag.status === 'cancelado' ? '#f8d7da' : '#fff3cd',
                padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem'
              }}>
                {ag.status.toUpperCase()}
              </span>
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {ag.itens.map(item => (
                <li key={item.id} style={{ padding: '4px 0', borderBottom: '1px solid var(--color-rose-light)' }}>
                  <strong>{item.servico.nome}</strong> – R$ {item.precoNaHora.toFixed(2)}
                </li>
              ))}
            </ul>
            {ag.motivoCancelamento && <p><strong>Motivo:</strong> {ag.motivoCancelamento}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {ag.status !== 'cancelado' && (
                <>
                  {pode ? <button onClick={() => handleEditar(ag)}>✏️ Alterar data/hora</button>
                    : <span style={{ color: '#999' }}>⚠️ Alteração permitida apenas com 2 dias ou mais de antecedência. Ligue para o salão.</span>}
                  {pode ? <button onClick={() => handleCancelar(ag.id)} style={{ background: '#dc3545' }}>🗑️ Cancelar</button>
                    : <button disabled style={{ background: '#ccc' }}>Cancelamento indisponível</button>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MeusAgendamentos;