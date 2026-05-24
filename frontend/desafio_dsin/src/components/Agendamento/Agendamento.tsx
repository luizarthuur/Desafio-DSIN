import React, { useState, useEffect } from 'react';
import { listarServicos, criarAgendamento, alterarAgendamento } from '../../services/api';
import type { Servico, Sugestao } from '../../types/index';
import './Agendamento.css';

const Agendamento: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]); // array de IDs
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
      setMensagem('⚠️ Selecione pelo menos um serviço.');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }
    setIsLoading(true);
    try {
      // Envia array com todos os IDs selecionados
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
      const msg = error.response?.data?.erro || 'Erro ao criar agendamento';
      setMensagem(`❌ ${msg}`);
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
      setMensagem('❌ Erro ao aceitar sugestão');
    } finally {
      setIsLoading(false);
    }
  };

  const recusarSugestao = () => {
    setSugestao(null);
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

  const hoje = new Date().toISOString().split('T')[0];

  const toggleServico = (id: number) => {
    if (servicosSelecionados.includes(id)) {
      setServicosSelecionados(servicosSelecionados.filter(sid => sid !== id));
    } else {
      setServicosSelecionados([...servicosSelecionados, id]);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
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

          {/* Serviços - checkboxes (múltipla escolha) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 10 }}>
              Escolha os serviços que deseja agendar (pode selecionar vários)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {servicos.map(s => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '16px 20px',
                    background: servicosSelecionados.includes(s.id) ? 'var(--color-rose-light)' : 'white',
                    borderRadius: 20,
                    border: '1px solid var(--color-rose-light)',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={servicosSelecionados.includes(s.id)}
                    onChange={() => toggleServico(s.id)}
                    style={{ width: 22, height: 22, margin: 0 }}
                  />
                  <img
                    src={s.imagemUrl || `https://via.placeholder.com/80?text=${s.nome.charAt(0)}`}
                    alt={s.nome}
                    style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', background: '#f0f0f0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{s.nome}</div>
                    {s.descricao && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>
                        <strong>Descrição:</strong> {s.descricao}
                      </div>
                    )}
                    <div style={{ fontSize: '1rem', marginTop: 6, color: 'var(--color-rose-burnt)', fontWeight: 500 }}>
                      R$ {s.preco.toFixed(2)} • {s.duracao} min
                    </div>
                  </div>
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