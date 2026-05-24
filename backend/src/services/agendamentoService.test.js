const { PrismaClient } = require('@prisma/client');
const agendamentoService = require('./agendamentoService');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

let clienteId;
let servicosIds;

// Função para limpar tabelas de forma segura (ignora se não existirem)
async function limparTabelas() {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "ItemAgendamento" RESTART IDENTITY CASCADE;`;
  } catch (e) { /* tabela pode não existir ainda */ }
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Agendamento" RESTART IDENTITY CASCADE;`;
  } catch (e) {}
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Cliente" RESTART IDENTITY CASCADE;`;
  } catch (e) {}
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "Servico" RESTART IDENTITY CASCADE;`;
  } catch (e) {}
}

beforeAll(async () => {
  // Limpa os dados (ignora se as tabelas não existirem)
  await limparTabelas();

  // Cria serviços
  await prisma.servico.createMany({
    data: [
      { nome: 'Corte Teste', duracao: 30, preco: 50 },
      { nome: 'Escova Teste', duracao: 20, preco: 40 },
    ],
  });
  const servicos = await prisma.servico.findMany();
  servicosIds = servicos.map(s => s.id);

  // Cria cliente
  const senhaHash = await bcrypt.hash('123456', 10);
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Cliente Teste',
      email: 'teste@service.com',
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

// Retorna uma data futura (X dias a partir de hoje) no formato YYYY-MM-DD
function dataFutura(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

describe('AgendamentoService', () => {
  test('deve criar um agendamento válido', async () => {
    const result = await agendamentoService.criar({
      clienteId,
      dataAgendamento: dataFutura(10),
      horaInicio: '10:00',
      servicosIds,
    });
    expect(result.agendamento).toHaveProperty('id');
    expect(result.agendamento.itens).toHaveLength(2);
    expect(result.sugestao).toBeNull();
  });

  test('não deve permitir conflito de horário', async () => {
    const dataConflito = dataFutura(12);
    const horaConflito = '14:00';

    // Primeiro agendamento (ok)
    await agendamentoService.criar({
      clienteId,
      dataAgendamento: dataConflito,
      horaInicio: horaConflito,
      servicosIds: [servicosIds[0]],
    });

    // Segundo agendamento no mesmo horário – deve lançar erro
    await expect(
      agendamentoService.criar({
        clienteId,
        dataAgendamento: dataConflito,
        horaInicio: horaConflito,
        servicosIds: [servicosIds[1]],
      })
    ).rejects.toThrow('Horário indisponível');
  });

  test('deve sugerir reagendamento na mesma semana', async () => {
    const dataBase = dataFutura(20); // data de referência
    const dataTerça = new Date(dataBase);
    dataTerça.setDate(dataTerça.getDate() - (dataTerça.getDay() + 2) % 7); // ajusta para terça
    const dataQuinta = new Date(dataTerça);
    dataQuinta.setDate(dataTerça.getDate() + 2);

    const diaTerça = dataTerça.toISOString().split('T')[0];
    const diaQuinta = dataQuinta.toISOString().split('T')[0];

    // Cria um agendamento na terça
    await agendamentoService.criar({
      clienteId,
      dataAgendamento: diaTerça,
      horaInicio: '09:00',
      servicosIds: [servicosIds[0]],
    });

    // Cria outro na quinta da mesma semana
    const result = await agendamentoService.criar({
      clienteId,
      dataAgendamento: diaQuinta,
      horaInicio: '11:00',
      servicosIds: [servicosIds[1]],
    });

    expect(result.sugestao).not.toBeNull();
    expect(result.sugestao.mensagem).toContain('Você já tem agendamento');
  });
});