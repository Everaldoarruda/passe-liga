import { useEffect, useState } from 'react';
import { listPlayers } from '../api/players';
import type { Player, PlayerPage } from '../api/types';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConditionBadge from '../components/ConditionBadge';
import DataTable, { type Column } from '../components/DataTable';
import Field, { inputClass } from '../components/Field';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { formatMoney } from '../lib/format';
import { notifySuccess } from '../lib/notify';

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
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();

  const changePage = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

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
