import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Field from './Field';

describe('Field', () => {
  it('liga o rótulo ao campo e mostra o erro junto dele', () => {
    render(
      <Field label="Nome" htmlFor="name" error="Campo obrigatório.">
        <input id="name" />
      </Field>,
    );
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório.');
  });
});
