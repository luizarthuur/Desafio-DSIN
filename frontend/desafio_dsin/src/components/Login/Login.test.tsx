import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { login } from '../../services/api';

vi.mock('../../services/api', () => ({
  login: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar campos de email, senha e botão', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve chamar a função login com os dados corretos ao submeter', async () => {
    const mockLogin = login as ReturnType<typeof vi.fn>;
    mockLogin.mockResolvedValueOnce({ data: { token: 'fake-token', usuario: { role: 'cliente' } } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'cliente@teste.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('cliente@teste.com', '123456');
    });
  });

  it('deve exibir mensagem de erro para credenciais inválidas', async () => {
    const mockLogin = login as ReturnType<typeof vi.fn>;
    mockLogin.mockRejectedValueOnce({ response: { data: { erro: 'Credenciais inválidas' } } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'errado@teste.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senhaerrada' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});