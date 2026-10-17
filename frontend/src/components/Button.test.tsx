import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('chama o onClick ao ser clicado', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fica desabilitado e não envia de novo enquanto está enviando', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Enviando...' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
