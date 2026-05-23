// frontend/src/components/Agendamento.tsx
import React, { useState, useEffect } from 'react';
import { listarServicos, criarAgendamento, alterarAgendamento } from '../../services/api';
import type { Servico, Sugestao } from '../../types/index';

const Agendamento: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [sugestao, setSugestao] = useState<Sugestao | null>(null);
  const [agendamentoId, setAgendamentoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    const carregarServicos = async () => {
      try {
        const res = await listarServicos();
        setServicos(res.data);
      } catch (error) {
        console.error('Erro ao carregar serviços', error);
      }
    };
    carregarServicos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (servicosSelecionados.length === 0) {
      setMensagem('Selecione pelo menos um serviço.');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }
    setIsLoading(true);
    try {
      const res = await criarAgendamento(usuario.id, data, hora, servicosSelecionados);
      const { agendamento, sugestao: sug } = res.data;
      setAgendamentoId(agendamento.id);
      if (sug) {
        setSugestao(sug);
      } else {
        setMensagem('✓ Agendamento criado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        limparFormulario();
      }
    } catch (error: any) {
      setMensagem(error.response?.data?.erro || 'Erro ao criar agendamento');
      setTimeout(() => setMensagem(''), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const aceitarSugestao = async () => {
    if (!agendamentoId || !sugestao) return;
    setIsLoading(true);
    try {
      const dataSugerida = new Date(sugestao.dataSugerida).toISOString().split('T')[0];
      await alterarAgendamento(agendamentoId, dataSugerida, hora, false);
      setMensagem('✓ Agendamento movido para a data sugerida!');
      setSugestao(null);
      setTimeout(() => setMensagem(''), 3000);
      limparFormulario();
    } catch (error: any) {
      setMensagem('Erro ao aceitar sugestão');
    } finally {
      setIsLoading(false);
    }
  };

  const recusarSugestao = () => {
    setSugestao(null);
    // Opcional: perguntar se deseja manter o agendamento original
    setMensagem('Agendamento mantido na data original.');
    setTimeout(() => setMensagem(''), 3000);
    limparFormulario();
  };

  const limparFormulario = () => {
    setData('');
    setHora('');
    setServicosSelecionados([]);
    setAgendamentoId(null);
  };

  // Impedir datas passadas (opcional)
  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-plum)', marginBottom: 20 }}>
          ✨ Novo Agendamento
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Data */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: 500 }}>Data</label>
            <input
              type="date"
              value={data}
              min={hoje}
              onChange={e => setData(e.target.value)}
              required
            />
          </div>

          {/* Horário */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: 500 }}>Horário</label>
            <input
              type="time"
              value={hora}
              onChange={e => setHora(e.target.value)}
              required
            />
          </div>

          {/* Serviços */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 10 }}>
              Escolha os serviços
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12
            }}>
              {servicos.map(s => (
                <label key={s.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background: servicosSelecionados.includes(s.id) ? 'var(--color-rose-light)' : 'white',
                  padding: '8px 12px',
                  borderRadius: 30,
                  transition: '0.2s'
                }}>
                  <input
                    type="checkbox"
                    value={s.id}
                    checked={servicosSelecionados.includes(s.id)}
                    onChange={e => {
                      if (e.target.checked)
                        setServicosSelecionados([...servicosSelecionados, s.id]);
                      else
                        setServicosSelecionados(servicosSelecionados.filter(id => id !== s.id));
                    }}
                  />
                  <span>{s.nome} - R$ {s.preco.toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: 12 }}
          >
            {isLoading ? 'Processando...' : 'Agendar Agora'}
          </button>
        </form>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className="card" style={{
          textAlign: 'center',
          backgroundColor: mensagem.includes('✓') ? '#e6f4ea' : '#fee',
          borderLeft: `4px solid ${mensagem.includes('✓') ? 'green' : 'red'}`
        }}>
          {mensagem}
        </div>
      )}

      {/* Sugestão de reagendamento */}
      {sugestao && (
        <div className="card" style={{
          marginTop: 20,
          border: `1px solid var(--color-gold)`,
          backgroundColor: '#fff9ef'
        }}>
          <h3 style={{ color: 'var(--color-plum)' }}>💡 Sugestão</h3>
          <p>{sugestao.mensagem}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={aceitarSugestao} className="button">
              Sim, usar esta data
            </button>
            <button onClick={recusarSugestao} style={{
              backgroundColor: 'transparent',
              color: 'var(--color-rose-burnt)',
              border: '1px solid var(--color-rose-burnt)'
            }}>
              Não, manter a minha
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendamento;