import type { Duel, DuelPlayer, MatchDetail } from '../api/types';
import { formatDateTime } from '../lib/format';
import { ATTRIBUTE_NAMES, RESULT_NAMES } from '../lib/labels';
import Badge from './Badge';
import DataTable, { type Column } from './DataTable';

function DuelPlayerCell({ player }: { player: DuelPlayer }) {
  return (
    <div>
      <p className="font-medium text-gray-900">{player.player_name}</p>
      <p className="text-xs text-gray-500">
        {player.position} · {ATTRIBUTE_NAMES[player.attribute]} {player.value}
        {player.condition === 'MAL_CONDICIONADO' && ' (mal condicionado)'}
      </p>
    </div>
  );
}

function buildDuelColumns(match: MatchDetail): Column<Duel>[] {
  return [
    { header: 'Duelo', render: (duel) => duel.order },
    {
      header: 'Ataca',
      render: (duel) =>
        duel.attacking_club_id === match.home.club_id ? match.home.club_name : match.away.club_name,
    },
    { header: 'Atacante', render: (duel) => <DuelPlayerCell player={duel.attacker} /> },
    { header: 'Defensor', render: (duel) => <DuelPlayerCell player={duel.defender} /> },
    {
      header: 'Gol',
      render: (duel) => (duel.goal ? <Badge tone="success">Gol</Badge> : <Badge>Sem gol</Badge>),
    },
  ];
}

function MatchResult({ match }: { match: MatchDetail }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-4 p-4">
        <span className="text-lg font-semibold">{match.home.club_name}</span>
        <strong className="text-3xl">
          {match.home.goals} × {match.away.goals}
        </strong>
        <span className="text-lg font-semibold">{match.away.club_name}</span>
      </div>
      <p className="pb-3 text-center text-sm text-gray-500">
        {RESULT_NAMES[match.result]} · {formatDateTime(match.played_at)}
      </p>
      <DataTable
        columns={buildDuelColumns(match)}
        rows={match.duels}
        rowKey={(duel) => duel.order}
        loading={false}
        error={null}
        emptyMessage="Sem duelos."
      />
    </div>
  );
}

export default MatchResult;
