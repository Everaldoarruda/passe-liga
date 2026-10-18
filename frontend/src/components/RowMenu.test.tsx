import { fireEvent, render, screen } from '@testing-library/react';
import { Pencil } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import RowMenu from './RowMenu';

describe('RowMenu', () => {
  it('abre ao clicar, executa a opção escolhida e fecha', () => {
    const onEdit = vi.fn();
    render(<RowMenu label="Ações de Ana" items={[{ label: 'Editar', icon: Pencil, onSelect: onEdit }]} />);
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Ana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('fecha com a tecla Esc e com um clique fora', () => {
    render(<RowMenu label="Ações de Ana" items={[{ label: 'Editar', icon: Pencil, onSelect: () => {} }]} />);
    const trigger = screen.getByRole('button', { name: 'Ações de Ana' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });
});
