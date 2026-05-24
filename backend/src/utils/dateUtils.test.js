const { getWeekStart, podeAlterar } = require('./dateUtils');

describe('dateUtils', () => {
  describe('getWeekStart', () => {
    test('deve retornar a segunda‑feira da semana de uma data (quarta‑feira)', () => {
      const data = new Date(2026, 4, 27); // 27/05/2026 (quarta)
      const inicio = getWeekStart(data);
      expect(inicio.toISOString().split('T')[0]).toBe('2026-05-25');
    });

    test('deve retornar a própria data se já for segunda‑feira', () => {
      const data = new Date(2026, 4, 25); // 25/05/2026 (segunda)
      const inicio = getWeekStart(data);
      expect(inicio.toISOString().split('T')[0]).toBe('2026-05-25');
    });

    test('para um domingo, deve retornar a segunda‑feira da mesma semana', () => {
      const domingo = new Date(2026, 4, 24); // 24/05/2026 (domingo)
      const inicio = getWeekStart(domingo);
      expect(inicio.toISOString().split('T')[0]).toBe('2026-05-18');
    });
  });

  describe('podeAlterar', () => {
    test('retorna true se diferença for >= 2 dias', () => {
      const hoje = new Date('2026-05-23');
      const dataFutura = new Date('2026-05-25');
      expect(podeAlterar(dataFutura, hoje)).toBe(true);
    });

    test('retorna false se diferença for < 2 dias', () => {
      const hoje = new Date('2026-05-23');
      const dataProxima = new Date('2026-05-24');
      expect(podeAlterar(dataProxima, hoje)).toBe(false);
    });
  });
});