import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('abre a página de jogadores com o menu de navegação', () => {
    render(
      <MemoryRouter initialEntries={['/players']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Jogadores' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clubes' })).toBeInTheDocument();
  });
});
