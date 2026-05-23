import React, { useState, useEffect } from 'react';
import { relatorioSemanal } from '../../services/api';
import type { RelatorioSemanal } from '../../types';
import { 
  FaChartLine, FaCalendarWeek, FaCalendarAlt, FaMoneyBillWave, 
  FaCheckCircle, FaClock, FaBan, FaCrown, FaPercent,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [loading, setLoading] = useState(true);
  const [semanaSelecionada, setSemanaSelecionada] = useState<Date>(new Date());

  useEffect(() => {
    const carregar = async () => {
      try {
        // Permitir passar uma data específica no futuro (ex: ?data=YYYY-MM-DD)
        const params = semanaSelecionada ? { data: semanaSelecionada.toISOString().split('T')[0] } : {};
        const res = await relatorioSemanal(params.data);
        setRelatorio(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [semanaSelecionada]);

  const formatarMoeda = (valor: number) => 
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const mudarSemana = (direcao: number) => {
    const nova = new Date(semanaSelecionada);
    nova.setDate(nova.getDate() + direcao * 7);
    setSemanaSelecionada(nova);
    setLoading(true);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50, fontFamily: 'var(--font-body)' }}>Carregando indicadores...</div>;
  if (!relatorio) return <div>Nenhum dado disponível.</div>;

  const totalAgendamentos = relatorio.totalAgendamentos;
  const taxaConfirmacao = totalAgendamentos > 0 ? (relatorio.confirmados / totalAgendamentos) * 100 : 0;
  const taxaCancelamento = totalAgendamentos > 0 ? (relatorio.cancelamentos / totalAgendamentos) * 100 : 0;

  // Ordena serviços mais pedidos para exibir barras de proporção
  const servicosOrdenados = [...relatorio.servicosMaisSolicitados].sort((a,b) => b.quantidade - a.quantidade);
  const maxQuantidade = servicosOrdenados[0]?.quantidade || 1;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      {/* Cabeçalho com navegação de semanas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--color-plum)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaChartLine size={28} /> Dashboard Gerencial
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => mudarSemana(-1)} className="button" style={{ padding: '6px 12px' }}>◀ Semana anterior</button>
          <span style={{ fontWeight: 'bold', background: 'white', padding: '6px 16px', borderRadius: 30, border: '1px solid var(--color-rose-light)' }}>
            {relatorio.semana.inicio} a {relatorio.semana.fim}
          </span>
          <button onClick={() => mudarSemana(1)} className="button" style={{ padding: '6px 12px' }}>Próxima semana ▶</button>
        </div>
      </div>

      {/* Cards principais de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ textAlign: 'center', borderTop: `4px solid var(--color-plum)` }}>
          <FaCalendarAlt size={32} color="var(--color-plum)" />
          <h3 style={{ margin: '8px 0' }}>{totalAgendamentos}</h3>
          <p>Total de agendamentos</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: `4px solid #28a745` }}>
          <FaMoneyBillWave size={32} color="#28a745" />
          <h3 style={{ margin: '8px 0' }}>{formatarMoeda(relatorio.receitaTotal)}</h3>
          <p>Receita prevista</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: `4px solid #17a2b8` }}>
          <FaCheckCircle size={32} color="#17a2b8" />
          <h3 style={{ margin: '8px 0' }}>{relatorio.confirmados}</h3>
          <p>Confirmados</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: `4px solid #ffc107` }}>
          <FaClock size={32} color="#ffc107" />
          <h3 style={{ margin: '8px 0' }}>{relatorio.pendentes}</h3>
          <p>Pendentes</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: `4px solid #dc3545` }}>
          <FaBan size={32} color="#dc3545" />
          <h3 style={{ margin: '8px 0' }}>{relatorio.cancelamentos}</h3>
          <p>Cancelamentos</p>
        </div>
      </div>

      {/* Gráficos e indicadores adicionais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
        {/* Distribuição de status (barras de progresso) */}
        
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaPercent /> Distribuição dos agendamentos</h3>
          <div style={{ marginTop: 16 }}>
            {totalAgendamentos === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum agendamento nesta semana.</p>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>✅ Confirmados</span>
                    <span>{taxaConfirmacao.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#e9ecef', borderRadius: 20, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${taxaConfirmacao}%`, background: '#28a745', height: '100%', borderRadius: 20 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🕒 Pendentes</span>
                    <span>{((relatorio.pendentes / totalAgendamentos) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#e9ecef', borderRadius: 20, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${(relatorio.pendentes / totalAgendamentos) * 100}%`, background: '#ffc107', height: '100%', borderRadius: 20 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>❌ Cancelados</span>
                    <span>{taxaCancelamento.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#e9ecef', borderRadius: 20, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${taxaCancelamento}%`, background: '#dc3545', height: '100%', borderRadius: 20 }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Serviços mais pedidos com barras horizontais */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaCrown /> Serviços mais procurados</h3>
          {servicosOrdenados.length === 0 && <p style={{ marginTop: 16 }}>Nenhum serviço realizado nesta semana.</p>}
          <div style={{ marginTop: 16 }}>
            {servicosOrdenados.map(serv => (
              <div key={serv.nome} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{serv.nome}</span>
                  <span>{serv.quantidade} vez(es)</span>
                </div>
                <div style={{ background: '#e9ecef', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${(serv.quantidade / maxQuantidade) * 100}%`, background: 'var(--color-gold)', height: '100%', borderRadius: 20 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights rápidos */}
      <div className="card" style={{ marginTop: 32, background: 'var(--color-nude)', borderLeft: `6px solid var(--color-gold)` }}>
        <h3>💡 Insights da semana</h3>
        <ul style={{ marginTop: 12, marginLeft: 20 }}>
          {taxaCancelamento > 30 && <li>Alta taxa de cancelamento – considere reforçar lembretes ou políticas de confirmação.</li>}
          {totalAgendamentos === 0 && <li>Nenhum agendamento esta semana. Reforce a divulgação!</li>}
          {relatorio.receitaTotal > 1000 && <li>Excelente semana! A receita superou os R$ 1.000,00.</li>}
          {!taxaCancelamento && totalAgendamentos > 0 && <li>Ótimo! Nenhum cancelamento registrado.</li>}
          {servicosOrdenados.length > 0 && <li>Serviço mais pedido: {servicosOrdenados[0].nome} – {servicosOrdenados[0].quantidade} vezes.</li>}
          <li>Total de clientes atendidos: {totalAgendamentos}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;