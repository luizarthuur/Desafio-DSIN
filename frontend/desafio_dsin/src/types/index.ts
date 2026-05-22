export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'cliente' | 'admin';
  }
  
  export interface Servico {
    id: number;
    nome: string;
    duracao: number;
    preco: number;
  }
  
  export interface ItemAgendamento {
    id: number;
    servicoId: number;
    servico: Servico;
    statusServico: 'pendente' | 'em_andamento' | 'concluido';
    precoNaHora: number;
  }
  
  export interface Agendamento {
    id: number;
    data: string;
    status: 'pendente' | 'confirmado' | 'cancelado';
    createdAt: string;
    clienteId: number;
    cliente: Usuario;
    itens: ItemAgendamento[];
  }
  
  export interface RelatorioSemanal {
    semana: { inicio: string; fim: string };
    totalAgendamentos: number;
    receitaTotal: number;
    servicosMaisSolicitados: { nome: string; quantidade: number }[];
    cancelamentos: number;
    confirmados: number;
    pendentes: number;
  }
  
  export interface Sugestao {
    mensagem: string;
    dataSugerida: string;
  }
  
  export interface CriarAgendamentoResponse {
    agendamento: Agendamento;
    sugestao: Sugestao | null;
  }