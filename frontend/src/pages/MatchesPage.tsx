import { Swords } from 'lucide-react';
import { useState } from 'react';
import { listClubs } from '../api/clubs';
import { playMatch, type MatchInput } from '../api/league';
import type { MatchDetail } from '../api/types';
import MatchForm from '../components/MatchForm';
import MatchHistory from '../components/MatchHistory';
import MatchResult from '../components/MatchResult';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { useSubmit } from '../hooks/useSubmit';

function MatchesPage() {
  const { data: clubs } = useFetch(listClubs);
  const { submitting, submit } = useSubmit();
  const [lastMatch, setLastMatch] = useState<MatchDetail | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const handlePlay = async (values: MatchInput) => {
    const match = await submit(
      () => playMatch(values),
      (result) =>
        `Partida jogada: ${result.home.club_name} ${result.home.goals} × ${result.away.goals} ${result.away.club_name}.`,
    );
    if (match === null) return;
    setLastMatch(match);
    setHistoryVersion((current) => current + 1);
  };

  return (
    <div>
      <PageHeader
        icon={Swords}
        title="Partidas"
        subtitle="Escolha o mandante e o visitante; o placar sai dos 6 duelos entre os titulares."
      />

      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <h2 className="px-4 pt-4 text-lg font-semibold text-gray-900">Nova partida</h2>
        <MatchForm clubs={clubs ?? []} submitting={submitting} onSubmit={handlePlay} />
      </div>

      {lastMatch && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white">
          <h2 className="px-4 pt-4 text-lg font-semibold text-gray-900">Resultado</h2>
          <MatchResult match={lastMatch} />
        </div>
      )}

      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <h2 className="px-4 pt-4 text-lg font-semibold text-gray-900">Histórico de partidas</h2>
        <MatchHistory clubs={clubs ?? []} key={historyVersion} />
      </div>
    </div>
  );
}

export default MatchesPage;
