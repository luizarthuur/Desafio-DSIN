import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MeusAgendamentos from './MeusAgendamentos';

vi.mock('../../services/api', () => ({
  get: vi.fn().mockResolvedValue({ data: [] }),
}));

describe('MeusAgendamentos Component', () => {
  it('deve renderizar o título da página', () => {
    render(
      <BrowserRouter>
        <MeusAgendamentos />
      </BrowserRouter>
    );
    expect(screen.getByText(/meus agendamentos/i)).toBeInTheDocument();
  });
});