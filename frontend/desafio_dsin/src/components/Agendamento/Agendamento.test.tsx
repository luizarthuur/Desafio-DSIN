import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Agendamento from './Agendamento';

vi.mock('../../services/api', () => ({
  listarServicos: vi.fn().mockResolvedValue({ data: [] }),
  criarAgendamento: vi.fn(),
}));

describe('Agendamento Component', () => {
  it('deve renderizar o título do formulário', async () => {
    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );
    expect(await screen.findByText(/novo agendamento/i)).toBeInTheDocument();
  });
});