// Retorna o início da semana (segunda-feira) de uma data
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 domingo, 1 segunda...
    const diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  // Verifica se a alteração pode ser feita (>= 2 dias de diferença)
  function podeAlterar(dataAgendamento, hoje = new Date()) {
    const diffDias = Math.ceil((dataAgendamento - hoje) / (1000 * 60 * 60 * 24));
    return diffDias >= 2;
  }
  
  module.exports = { getWeekStart, podeAlterar };