import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Player } from '../api/types';
import PlayerForm from './PlayerForm';

const player: Player = {
  id: 7,
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  condition: 'APTO',
  base_value: 40,
  market_value: 40,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
  overall: 75,
  club_id: 2,
};

describe('PlayerForm', () => {
  it('valida antes de enviar e mostra a mensagem junto ao campo', () => {
    const onSubmit = vi.fn();
    render(<PlayerForm submitting={false} onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText('Campo obrigatório.').length).toBeGreaterThan(0);
  });

  it('na edição, impede mudar a posição de jogador com clube e diminuir a idade', () => {
    const onSubmit = vi.fn();
    render(<PlayerForm player={player} submitting={false} onSubmit={onSubmit} onCancel={() => {}} />);
    expect(screen.getByLabelText('Posição')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Idade'), { target: { value: '24' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um número inteiro de 25 a 45.')).toBeInTheDocument();
  });
});
