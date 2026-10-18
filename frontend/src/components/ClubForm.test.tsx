import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClubForm from './ClubForm';

describe('ClubForm', () => {
  it('valida o nome e a sigla antes de enviar', () => {
    const onSubmit = vi.fn();
    render(<ClubForm submitting={false} onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'FC' } });
    fireEvent.change(screen.getByLabelText('Sigla'), { target: { value: 'ag' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar clube' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Use de 3 a 60 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Use exatamente 3 letras maiúsculas, de A a Z.')).toBeInTheDocument();
  });

  it('envia os dados quando estão válidos', () => {
    const onSubmit = vi.fn();
    render(<ClubForm submitting={false} onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Águias FC' } });
    fireEvent.change(screen.getByLabelText('Sigla'), { target: { value: 'AGU' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar clube' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Águias FC', acronym: 'AGU' });
  });
});
