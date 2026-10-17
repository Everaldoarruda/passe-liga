import { useEffect, useState } from 'react';
import { listPlayers } from '../api/players';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConditionBadge from '../components/ConditionBadge';

function PlayersPage() {
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPlayers()
      .then((page) => setTotal(page.meta.total_items))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Jogadores</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>GOL</Badge>
        <ConditionBadge condition="APTO" />
        <ConditionBadge condition="MAL_CONDICIONADO" />
        <ConditionBadge condition="DOENTE" />
        <Button variant="primary">+ Novo jogador</Button>
        <Button>Comprar</Button>
        <Button loading>Comprar</Button>
      </div>

      {error && <p className="mt-2 text-red-600">{error}</p>}
      {total !== null && <p className="mt-2 text-gray-600">{total} jogadores cadastrados</p>}
    </div>
  );
}

export default PlayersPage;
