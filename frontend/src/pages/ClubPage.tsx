import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { getClub } from '../api/clubs';
import type { SquadPlayer } from '../api/types';
import Badge from '../components/Badge';
import ConditionBadge from '../components/ConditionBadge';
import DataTable, { type Column } from '../components/DataTable';
import PlayerName from '../components/PlayerName';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime, formatMoney } from '../lib/format';

const squadColumns: Column<SquadPlayer>[] = [
  { header: 'Jogador', render: (player) => <PlayerName player={player} /> },
  { header: 'Posição', render: (player) => <Badge>{player.position}</Badge> },
  { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
  {
    header: 'Valor de mercado',
    align: 'right',
    render: (player) => <strong>{formatMoney(player.market_value)}</strong>,
  },
  {
    header: 'Fim da fidelidade',
    render: (player) => (player.contract ? formatDateTime(player.contract.loyalty_until) : '—'),
  },
  { header: 'Dias restantes', align: 'right', render: (player) => player.contract?.remaining_days ?? '—' },
  {
    header: '% de multa',
    align: 'right',
    render: (player) => (player.contract ? `${player.contract.penalty_rate}%` : '—'),
  },
];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(value)}</p>
    </div>
  );
}

function ClubPage() {
  const { id } = useParams();
  const loadClub = useCallback(() => getClub(Number(id)), [id]);
  const { data: club, loading, error } = useFetch(loadClub);

  return (
    <div>
      <Link to="/clubs" className="text-sm text-gray-500 hover:text-gray-900">
        ← Clubes
      </Link>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-brand">
        {club?.name ?? 'Clube'}
        {club && <Badge>{club.acronym}</Badge>}
      </h1>

      {club && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Caixa" value={club.cash} />
          <Stat label="Valor do elenco" value={club.squad_value} />
          <Stat label="Patrimônio" value={club.net_worth} />
        </div>
      )}

      <h2 className="mt-6 text-lg font-semibold text-gray-900">Elenco</h2>
      <div className="mt-2 rounded-lg border border-gray-200 bg-white">
        <DataTable
          columns={squadColumns}
          rows={club?.players ?? []}
          rowKey={(player) => player.id}
          loading={loading}
          error={error}
          emptyMessage="O clube ainda não tem jogadores."
        />
      </div>
    </div>
  );
}

export default ClubPage;
