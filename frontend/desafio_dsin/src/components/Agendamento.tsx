import React, { useState, useEffect } from 'react';
import { listarServicos, criarAgendamento, alterarAgendamento } from '../services/api';
import type { Servico, Sugestao, CriarAgendamentoResponse } from '../types';

const Agendamento: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [sugestao, setSugestao] = useState<Sugestao | null>(null);
  const [agendamentoId, setAgendamentoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    listarServicos().then(res => setServicos(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await criarAgendamento(usuario.id, data, hora, servicosSelecionados);
      const { agendamento, sugestao: sug } = res.data;
      setAgendamentoId(agendamento.id);
      if (sug) {
        setSugestao(sug);
      } else {
        setMensagem('Agendamento criado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      }
    } catch (error: any) {
      setMensagem(error.response?.data?.erro || 'Erro ao criar agendamento');
    }
  };

  const aceitarSugestao = async () => {
    if (!agendamentoId || !sugestao) return;
    try {
      const dataSugerida = new Date(sugestao.dataSugerida).toISOString().split('T')[0];
      await alterarAgendamento(agendamentoId, dataSugerida, hora, false);
      setMensagem('Agendamento movido para a data sugerida!');
      setSugestao(null);
      setTimeout(() => setMensagem(''), 3000);
    } catch (error: any) {
      setMensagem('Erro ao aceitar sugestão');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Novo Agendamento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Data:</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required />
        </div>
        <div>
          <label>Horário:</label>
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} required />
        </div>
        <div>
          <label>Serviços:</label>
          {servicos.map(s => (
            <div key={s.id}>
              <input
                type="checkbox"
                value={s.id}
                onChange={e => {
                  if (e.target.checked)
                    setServicosSelecionados([...servicosSelecionados, s.id]);
                  else
                    setServicosSelecionados(servicosSelecionados.filter(id => id !== s.id));
                }}
              /> {s.nome} - R$ {s.preco}
            </div>
          ))}
        </div>
        <button type="submit">Agendar</button>
      </form>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {sugestao && (
        <div style={{ marginTop: 20, border: '1px solid orange', padding: 10 }}>
          <p>{sugestao.mensagem}</p>
          <button onClick={aceitarSugestao}>Sim, usar esta data</button>
          <button onClick={() => setSugestao(null)}>Não, manter a data escolhida</button>
        </div>
      )}
    </div>
  );
};

export default Agendamento;