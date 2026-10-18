import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PlayerFilters } from '../api/players';
import PlayerFiltersBar from './PlayerFiltersBar';

const filters: PlayerFilters = {
  page: 1,
  search: '',
  position: '',
  condition: '',
  free: '',
  club_id: '3',
  min_age: '',
  max_age: '',
  min_value: '',
  max_value: '',
  sort: 'name',
};

describe('PlayerFiltersBar', () => {
  it('ao escolher só os livres, limpa o filtro por clube', () => {
    const onChange = vi.fn();
    render(<PlayerFiltersBar filters={filters} clubs={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Livres' }));
    expect(onChange).toHaveBeenCalledWith({ free: 'true', club_id: '' });
  });

  it('desabilita o filtro por clube enquanto mostra só os livres', () => {
    render(<PlayerFiltersBar filters={{ ...filters, free: 'true' }} clubs={[]} onChange={() => {}} />);
    expect(screen.getByLabelText('Clube')).toBeDisabled();
  });
});
