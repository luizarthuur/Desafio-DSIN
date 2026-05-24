const { PrismaClient } = require('@prisma/client');
const relatorioService = require('./relatorioService');
const bcrypt = require('bcryptjs');
const { getWeekStart } = require('../utils/dateUtils');

const prisma = new PrismaClient();

let clienteId;
let servicosIds;

beforeAll(async () => {
  await prisma.itemAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.servico.deleteMany();

  await prisma.servico.createMany({
    data: [
      { nome: 'Corte', duracao: 30, preco: 50.0 },
      { nome: 'Escova', duracao: 20, preco: 40.0 },
      { nome: 'Tintura', duracao: 90, preco: 120.0 },
    ],
  });
  const servicos = await prisma.servico.findMany();
  servicosIds = servicos.map(s => s.id);

  const senhaHash = await bcrypt.hash('123456', 10);
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Cliente Relatorio',
      email: 'relatorio@teste.com',
      telefone: '11999999999',
      senha: senhaHash,
      role: 'cliente',
    },
  });
  clienteId = cliente.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarAgendamento(data, hora, servicosIdsArray, status = 'pendente') {
  const dataHora = new Date(`${data}T${hora}:00`);
  const agendamento = await prisma.agendamento.create({
    data: {
      data: dataHora,
      status,
      clienteId,
      itens: {
        create: servicosIdsArray.map(servicoId => ({
          servicoId,
          statusServico: 'pendente',
          precoNaHora: 0,
        })),
      },
    },
    include: { itens: true },
  });

  for (const item of agendamento.itens) {
    const servico = await prisma.servico.findUnique({ where: { id: item.servicoId } });
    await prisma.itemAgendamento.update({
      where: { id: item.id },
      data: { precoNaHora: servico.preco },
    });
  }
  return agendamento;
}

describe('relatorioService', () => {
  test('deve retornar desempenho correto para uma semana com agendamentos', async () => {
    const dataReferencia = new Date(2026, 4, 20);
    const inicioSemana = getWeekStart(dataReferencia);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 7);
    fimSemana.setHours(0, 0, 0, 0);

    // Cria apenas agendamentos não cancelados
    await criarAgendamento('2026-05-20', '10:00', [servicosIds[0], servicosIds[1]]);
    await criarAgendamento('2026-05-22', '14:00', [servicosIds[2]], 'confirmado');

    const resultado = await relatorioService.desempenhoSemanal(dataReferencia);

    expect(resultado.semana.inicio).toBe(inicioSemana.toISOString().split('T')[0]);
    expect(resultado.semana.fim).toBe(fimSemana.toISOString().split('T')[0]);
    expect(resultado.totalAgendamentos).toBe(2);
    expect(resultado.receitaTotal).toBe(50 + 40 + 120);
    expect(resultado.confirmados).toBe(1);
    expect(resultado.pendentes).toBe(1);
    expect(resultado.cancelamentos).toBe(0);
    expect(resultado.servicosMaisSolicitados).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'Corte', quantidade: 1 }),
        expect.objectContaining({ nome: 'Escova', quantidade: 1 }),
        expect.objectContaining({ nome: 'Tintura', quantidade: 1 }),
      ])
    );
  });

  test('deve retornar zeros quando não há agendamentos na semana', async () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 30);
    const resultado = await relatorioService.desempenhoSemanal(dataFutura);
    expect(resultado.totalAgendamentos).toBe(0);
    expect(resultado.receitaTotal).toBe(0);
    expect(resultado.servicosMaisSolicitados).toEqual([]);
    expect(resultado.confirmados).toBe(0);
    expect(resultado.pendentes).toBe(0);
    expect(resultado.cancelamentos).toBe(0);
  });
});