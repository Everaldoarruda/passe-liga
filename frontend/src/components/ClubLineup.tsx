import { useCallback } from 'react';
import { getLineup, saveLineup, type LineupInput } from '../api/league';
import type { Player } from '../api/types';
import { useFetch } from '../hooks/useFetch';
import Badge from './Badge';
import ConditionBadge from './ConditionBadge';
import DataTable, { type Column } from './DataTable';
import PlayerName from './PlayerName';
import { useSubmit } from '../hooks/useSubmit';
import LineupForm from './LineupForm';

const lineupColumns: Column<Player>[] = [
  { header: 'Jogador', render: (player) => <PlayerName player={player} /> },
  { header: 'Posição', render: (player) => <Badge>{player.position}</Badge> },
  { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
];

function ClubLineup({ clubId, squad }: { clubId: number; squad: Player[] }) {
  const loadLineup = useCallback(() => getLineup(clubId), [clubId]);
  const { data: lineup, loading, error, reload } = useFetch(loadLineup);
  const { submitting, submit } = useSubmit();

  const handleSave = async (values: LineupInput) => {
    const saved = await submit(
      () => saveLineup(clubId, values),
      (result) => `Escalação ${result.formation} salva.`,
    );
    if (saved !== null) reload();
  };

  return (
    <div>
      {lineup && (
        <div className="flex flex-wrap items-center gap-2 p-3 text-sm">
          <span className="text-gray-600">Formação atual:</span>
          <strong>{lineup.formation ?? 'nenhuma'}</strong>
          {!lineup.complete && (
            <span role="alert" className="rounded bg-amber-50 px-2 py-0.5 text-amber-800">
              Escalação incompleta: o clube não pode jogar partidas.
            </span>
          )}
        </div>
      )}
      <DataTable
        columns={lineupColumns}
        rows={lineup?.players ?? []}
        rowKey={(player) => player.id}
        loading={loading}
        error={error}
        emptyMessage="O clube ainda não escalou titulares."
      />
      <div className="border-t border-gray-200">
        <h3 className="px-3 pt-3 text-sm font-semibold text-gray-900">Nova escalação</h3>
        <LineupForm squad={squad} submitting={submitting} onSubmit={handleSave} />
      </div>
    </div>
  );
}

export default ClubLineup;
