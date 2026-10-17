import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  it('não desenha nada quando está fechado', () => {
    render(
      <Modal title="Confirmar" open={false} onClose={() => {}}>
        Conteúdo
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mostra o título e fecha com a tecla Esc', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Confirmar" open onClose={onClose}>
        Conteúdo
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Confirmar' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
