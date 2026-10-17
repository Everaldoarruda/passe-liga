import { useEffect, useState } from 'react';
import { listPlayers } from '../api/players';
import type { Player, PlayerPage } from '../api/types';
import Badge from '../components/Badge';
import ConditionBadge from '../components/ConditionBadge';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import { formatMoney } from '../lib/format';

const columns: Column<Player>[] = [
  { header: 'Jogador', render: (player) => player.name },
  { header: 'Posição', render: (player) => <Badge>{player.position}</Badge> },
  { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
  { header: 'Valor de mercado', align: 'right', render: (player) => formatMoney(player.market_value) },
];

function PlayersPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PlayerPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const changePage = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  useEffect(() => {
    listPlayers(page)
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Jogadores</h1>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <DataTable
          columns={columns}
          rows={result?.data ?? []}
          rowKey={(player) => player.id}
          loading={loading}
          error={error}
          emptyMessage="Nenhum jogador encontrado."
        />
        {result && (
          <Pagination
            page={result.meta.page}
            limit={result.meta.limit}
            totalItems={result.meta.total_items}
            totalPages={result.meta.total_pages}
            itemLabel="jogadores"
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}

export default PlayersPage;
