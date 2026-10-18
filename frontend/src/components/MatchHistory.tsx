import { useCallback, useState } from 'react';
import { getMatch, listMatches } from '../api/league';
import type { Club, Match, MatchDetail } from '../api/types';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime } from '../lib/format';
import { notifyError } from '../lib/notify';
import Button from './Button';
import DataTable, { type Column } from './DataTable';
import Field, { inputClass } from './Field';
import MatchResult from './MatchResult';
import Modal from './Modal';

interface MatchHistoryProps {
  clubs: Club[];
}

function MatchHistory({ clubs }: MatchHistoryProps) {
  const [clubId, setClubId] = useState('');
  const loadMatches = useCallback(() => listMatches(clubId), [clubId]);
  const { data, loading, error } = useFetch(loadMatches);
  const [opened, setOpened] = useState<MatchDetail | null>(null);

  const openMatch = async (match: Match) => {
    try {
      setOpened(await getMatch(match.id));
    } catch (failure) {
      notifyError(failure);
    }
  };

  const columns: Column<Match>[] = [
    { header: 'Data e hora', render: (match) => formatDateTime(match.played_at) },
    { header: 'Mandante', align: 'right', render: (match) => match.home.club_name },
    {
      header: 'Placar',
      render: (match) => (
        <strong className="block text-center">
          {match.home.goals} × {match.away.goals}
        </strong>
      ),
    },
    { header: 'Visitante', render: (match) => match.away.club_name },
    {
      header: 'Ações',
      render: (match) => (
        <Button className="px-2 py-1 text-xs" onClick={() => openMatch(match)}>
          Ver duelos
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="w-64 p-3">
        <Field label="Filtrar por clube" htmlFor="matches-club">
          <select
            id="matches-club"
            className={inputClass}
            value={clubId}
            onChange={(event) => setClubId(event.target.value)}
          >
            <option value="">Todos os clubes</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(match) => match.id}
        loading={loading}
        error={error}
        emptyMessage="Nenhuma partida jogada."
      />
      {opened && (
        <Modal
          title={`Partida ${opened.home.club_name} × ${opened.away.club_name}`}
          open
          onClose={() => setOpened(null)}
        >
          <MatchResult match={opened} />
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpened(null)}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MatchHistory;
