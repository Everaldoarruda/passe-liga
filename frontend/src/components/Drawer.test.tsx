import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Drawer from './Drawer';

describe('Drawer', () => {
  it('fecha com a tecla Esc e no fundo escuro, mas não num clique dentro do painel', () => {
    const onClose = vi.fn();
    render(
      <Drawer label="Detalhes de Ana" onClose={onClose}>
        Conteúdo
      </Drawer>,
    );
    fireEvent.click(screen.getByText('Conteúdo'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
