import axios from 'axios';
import type { Agendamento, RelatorioSemanal, CriarAgendamentoResponse, Usuario, Servico } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipagem das respostas
export const login = (email: string, senha: string) =>
  api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha });

export const listarServicos = () => api.get<Servico[]>('/servicos');

export const criarAgendamento = (clienteId: number, data: string, horaInicio: string, servicosIds: number[]) =>
  api.post<CriarAgendamentoResponse>('/agendamentos', { clienteId, data, horaInicio, servicosIds });

export const alterarAgendamento = (id: number, novaData: string, novaHora: string, isAdmin: boolean) =>
  api.put<Agendamento>(`/agendamentos/${id}`, { novaData, novaHora, isAdmin });

export const historicoCliente = (clienteId: number, dataInicio: string, dataFim: string) =>
  api.get<Agendamento[]>(`/agendamentos/historico`, { params: { clienteId, dataInicio, dataFim } });

export const listarTodosAgendamentos = () => api.get<Agendamento[]>('/agendamentos/todos');

export const confirmarAgendamento = (id: number) => api.patch(`/agendamentos/${id}/confirmar`);

export const atualizarStatusItem = (itemId: number, status: string) =>
  api.patch(`/agendamentos/itens/${itemId}/status`, { status });

export const relatorioSemanal = (data?: string) =>
  api.get<RelatorioSemanal>('/relatorios/desempenho-semanal', { params: { data } });

export default api;