import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { listClubs } from '../api/clubs';
import { listPlayers, type PlayerFilters } from '../api/players';
import type { Club, Player } from '../api/types';
import AgilityBar from '../components/AgilityBar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConditionBadge from '../components/ConditionBadge';
import DataTable, { type Column } from '../components/DataTable';
import Field, { inputClass } from '../components/Field';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import PlayerFiltersBar from '../components/PlayerFiltersBar';
import { useFetch } from '../hooks/useFetch';
import { formatMoney, initials } from '../lib/format';
import { POSITION_NAMES } from '../lib/labels';
import { notifySuccess } from '../lib/notify';

function buildColumns(clubsById: Map<number, Club>): Column<Player>[] {
  return [
    {
      header: 'Jogador',
      render: (player) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {initials(player.name)}
          </span>
          <div>
            <p className="font-medium text-gray-900">{player.name}</p>
            <p className="text-xs text-gray-500">{POSITION_NAMES[player.position]}</p>
          </div>
        </div>
      ),
    },
    { header: 'Posição', render: (player) => <Badge>{player.position}</Badge> },
    { header: 'Overall', align: 'right', render: (player) => <strong>{player.overall}</strong> },
    { header: 'Agilidade', render: (player) => <AgilityBar agility={player.agility} /> },
    { header: 'Idade', align: 'right', render: (player) => player.age },
    { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    {
      header: 'Valor base',
      align: 'right',
      render: (player) => <span className="text-gray-500">{formatMoney(player.base_value)}</span>,
    },
    {
      header: 'Valor de mercado',
      align: 'right',
      render: (player) => <strong>{formatMoney(player.market_value)}</strong>,
    },
    { header: 'Clube', render: (player) => <ClubCell club={clubsById.get(player.club_id ?? 0)} /> },
  ];
}

function ClubCell({ club }: { club: Club | undefined }) {
  if (!club) return <Badge>Livre</Badge>;
  return (
    <div className="flex items-center gap-2">
      <Badge>{club.acronym}</Badge>
      <Link to={`/clubs/${club.id}`} className="text-gray-900 underline">
        {club.name}
      </Link>
    </div>
  );
}

const INITIAL_FILTERS: PlayerFilters = {
  page: 1,
  search: '',
  position: '',
  condition: '',
  free: '',
  club_id: '',
  min_age: '',
  max_age: '',
  min_value: '',
  max_value: '',
  sort: 'name',
};

function PlayersPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const loadPlayers = useCallback(() => {
    const search = filters.search.trim();
    return listPlayers({ ...filters, search: search.length >= 2 ? search : '' });
  }, [filters]);
  const { data, loading, error } = useFetch(loadPlayers);
  const { data: clubs } = useFetch(listClubs);
  const columns = buildColumns(new Map(clubs?.map((club) => [club.id, club])));
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();

  const changeFilters = (changes: Partial<PlayerFilters>) =>
    setFilters((current) => ({ ...current, ...changes, page: 1 }));
  const changePage = (page: number) => setFilters((current) => ({ ...current, page }));

  const closeForm = () => {
    setFormOpen(false);
    setName('');
    setNameError(undefined);
  };

  const saveForm = () => {
    if (name.trim().length < 3) {
      setNameError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    notifySuccess(`Teste: "${name}" seria cadastrado.`);
    closeForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Jogadores</h1>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          + Novo jogador
        </Button>
      </div>

      <Modal title="Novo jogador" open={formOpen} onClose={closeForm}>
        <Field label="Nome" htmlFor="player-name" error={nameError}>
          <input
            id="player-name"
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={closeForm}>Cancelar</Button>
          <Button variant="primary" onClick={saveForm}>
            Salvar
          </Button>
        </div>
      </Modal>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <PlayerFiltersBar filters={filters} clubs={clubs ?? []} onChange={changeFilters} />
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(player) => player.id}
          loading={loading}
          error={error}
          emptyMessage="Nenhum jogador encontrado."
        />
        {data && (
          <Pagination
            page={data.meta.page}
            limit={data.meta.limit}
            totalItems={data.meta.total_items}
            totalPages={data.meta.total_pages}
            itemLabel="jogadores"
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}

export default PlayersPage;
