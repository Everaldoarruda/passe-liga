import type { PlayerFilters } from '../api/players';
import type { Club } from '../api/types';
import { CONDITION_NAMES, POSITION_NAMES } from '../lib/labels';
import Field, { inputClass } from './Field';
import Tabs from './Tabs';

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'value_desc', label: 'Maior valor de mercado' },
  { value: 'value_asc', label: 'Menor valor de mercado' },
  { value: 'age_asc', label: 'Mais novos' },
  { value: 'age_desc', label: 'Mais velhos' },
  { value: 'position', label: 'Posição' },
];

const FREE_TABS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Livres' },
  { value: 'false', label: 'Em clubes' },
];

type NumberFilter = 'min_age' | 'max_age' | 'min_value' | 'max_value';

const NUMBER_FILTERS: { key: NumberFilter; label: string; min: string; max?: string; step: string }[] = [
  { key: 'min_age', label: 'Idade mínima', min: '16', max: '45', step: '1' },
  { key: 'max_age', label: 'Idade máxima', min: '16', max: '45', step: '1' },
  { key: 'min_value', label: 'Valor mínimo', min: '0', step: '0.01' },
  { key: 'max_value', label: 'Valor máximo', min: '0', step: '0.01' },
];

interface PlayerFiltersBarProps {
  filters: PlayerFilters;
  clubs: Club[];
  onChange: (changes: Partial<PlayerFilters>) => void;
}

function PlayerFiltersBar({ filters, clubs, onChange }: PlayerFiltersBarProps) {
  const onlyFree = filters.free === 'true';

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Buscar por nome" htmlFor="filter-search">
          <input
            id="filter-search"
            className={inputClass}
            placeholder="Digite ao menos 2 letras"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </Field>
        <Field label="Posição" htmlFor="filter-position">
          <select
            id="filter-position"
            className={inputClass}
            value={filters.position}
            onChange={(event) => onChange({ position: event.target.value })}
          >
            <option value="">Todas</option>
            {Object.entries(POSITION_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Condição" htmlFor="filter-condition">
          <select
            id="filter-condition"
            className={inputClass}
            value={filters.condition}
            onChange={(event) => onChange({ condition: event.target.value })}
          >
            <option value="">Todas</option>
            {Object.entries(CONDITION_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Clube" htmlFor="filter-club">
          <select
            id="filter-club"
            className={inputClass}
            value={filters.club_id}
            disabled={onlyFree}
            title={onlyFree ? 'Indisponível ao mostrar só os livres' : undefined}
            onChange={(event) => onChange({ club_id: event.target.value })}
          >
            <option value="">Todos</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </Field>
        {NUMBER_FILTERS.map(({ key, label, min, max, step }) => (
          <Field key={key} label={label} htmlFor={`filter-${key}`}>
            <input
              id={`filter-${key}`}
              type="number"
              min={min}
              max={max}
              step={step}
              className={inputClass}
              value={filters[key]}
              onChange={(event) => onChange({ [key]: event.target.value })}
            />
          </Field>
        ))}
        <Field label="Ordenar por" htmlFor="filter-sort">
          <select
            id="filter-sort"
            className={inputClass}
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Tabs
        label="Situação"
        options={FREE_TABS}
        value={filters.free}
        onChange={(free) => onChange(free === 'true' ? { free, club_id: '' } : { free })}
      />
    </div>
  );
}

export default PlayerFiltersBar;
