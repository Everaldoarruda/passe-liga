import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { listClubs } from '../api/clubs';
import {
  changeCondition,
  createPlayer,
  deletePlayer,
  listPlayers,
  updatePlayer,
  type PlayerCreate,
  type PlayerFilters,
} from '../api/players';
import type { Club, Condition, Player, Purchase } from '../api/types';
import AgilityBar from '../components/AgilityBar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConditionBadge from '../components/ConditionBadge';
import ConditionForm from '../components/ConditionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { type Column } from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import PlayerFiltersBar from '../components/PlayerFiltersBar';
import PlayerForm from '../components/PlayerForm';
import PlayerName from '../components/PlayerName';
import { useFetch } from '../hooks/useFetch';
import { useSubmit } from '../hooks/useSubmit';
import { formatMoney, formatDateTime } from '../lib/format';
import { buyPlayer, type PurchaseInput } from '../api/market';
import BuyForm from '../components/BuyForm';
import ResultList from '../components/ResultList';

type Dialog =
  | { type: 'create' }
  | { type: 'edit'; player: Player }
  | { type: 'condition'; player: Player }
  | { type: 'delete'; player: Player }
  | { type: 'buy'; player: Player }
  | { type: 'purchase'; purchase: Purchase };

interface RowActions {
  onBuy: (player: Player) => void;
  onEdit: (player: Player) => void;
  onCondition: (player: Player) => void;
  onDelete: (player: Player) => void;
}

const smallButton = 'px-2 py-1 text-xs';

function buildColumns(clubsById: Map<number, Club>, actions: RowActions): Column<Player>[] {
  return [
    { header: 'Jogador', render: (player) => <PlayerName player={player} /> },
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
    {
      header: 'Ações',
      render: (player) => (
        <div className="flex justify-end gap-1">
          {player.club_id === null && (
            <Button className={smallButton} onClick={() => actions.onBuy(player)}>
              Comprar
            </Button>
          )}
          <Button className={smallButton} onClick={() => actions.onEdit(player)}>
            Editar
          </Button>
          <Button className={smallButton} onClick={() => actions.onCondition(player)}>
            Condição
          </Button>
          {player.club_id === null && (
            <Button className={smallButton} onClick={() => actions.onDelete(player)}>
              Excluir
            </Button>
          )}
        </div>
      ),
    },
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
  const { data, loading, error, reload } = useFetch(loadPlayers);
  const { data: clubs } = useFetch(listClubs);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const { submitting, submit } = useSubmit();

  const changeFilters = (changes: Partial<PlayerFilters>) =>
    setFilters((current) => ({ ...current, ...changes, page: 1 }));
  const changePage = (page: number) => setFilters((current) => ({ ...current, page }));
  const closeDialog = () => setDialog(null);

  const finish = (outcome: unknown) => {
    if (outcome === null) return;
    closeDialog();
    reload();
  };

  const handleCreate = async (values: PlayerCreate) =>
    finish(
      await submit(
        () => createPlayer(values),
        (player) =>
          `${player.name} cadastrado: overall ${player.overall}, valor base ${formatMoney(player.base_value)}.`,
      ),
    );

  const handleEdit = async (player: Player, values: PlayerCreate) =>
    finish(
      await submit(
        () =>
          updatePlayer(player.id, {
            name: values.name,
            position: values.position,
            agility: values.agility,
            age: values.age,
          }),
        (updated) => `${updated.name} atualizado.`,
      ),
    );

  const handleCondition = async (player: Player, condition: Condition) =>
    finish(
      await submit(
        () => changeCondition(player.id, condition),
        (updated) => `Condição de ${updated.name} alterada.`,
      ),
    );

  const handleBuy = async (player: Player, values: PurchaseInput) => {
    const purchase = await submit(
      () => buyPlayer(player.id, values),
      (result) => `${result.player_name} comprado.`,
    );
    if (purchase === null) return;
    setDialog({ type: 'purchase', purchase });
    reload();
  };

  const handleDelete = async (player: Player) =>
    finish(
      await submit(
        () => deletePlayer(player.id),
        () => `${player.name} excluído.`,
      ),
    );

  const columns = buildColumns(new Map(clubs?.map((club) => [club.id, club])), {
    onBuy: (player) => setDialog({ type: 'buy', player }),
    onEdit: (player) => setDialog({ type: 'edit', player }),
    onCondition: (player) => setDialog({ type: 'condition', player }),
    onDelete: (player) => setDialog({ type: 'delete', player }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Jogadores</h1>
        <Button variant="primary" onClick={() => setDialog({ type: 'create' })}>
          + Novo jogador
        </Button>
      </div>

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

      <Modal title="Novo jogador" open={dialog?.type === 'create'} onClose={closeDialog}>
        <PlayerForm submitting={submitting} onSubmit={handleCreate} onCancel={closeDialog} />
      </Modal>

      {dialog?.type === 'edit' && (
        <Modal title={`Editar ${dialog.player.name}`} open onClose={closeDialog}>
          <PlayerForm
            player={dialog.player}
            submitting={submitting}
            onSubmit={(values) => handleEdit(dialog.player, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.type === 'condition' && (
        <Modal title={`Condição de ${dialog.player.name}`} open onClose={closeDialog}>
          <ConditionForm
            player={dialog.player}
            submitting={submitting}
            onSubmit={(condition) => handleCondition(dialog.player, condition)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Excluir jogador"
          open
          confirmLabel="Excluir"
          submitting={submitting}
          onConfirm={() => handleDelete(dialog.player)}
          onClose={closeDialog}
        >
          Excluir <strong>{dialog.player.name}</strong>? Ele deixa de aparecer na lista, mas as transações
          antigas continuam no histórico.
        </ConfirmDialog>
      )}

      {dialog?.type === 'buy' && (
        <Modal title={`Comprar ${dialog.player.name}`} open onClose={closeDialog}>
          <BuyForm
            player={dialog.player}
            clubs={clubs ?? []}
            submitting={submitting}
            onSubmit={(values) => handleBuy(dialog.player, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.type === 'purchase' && (
        <Modal title="Compra realizada" open onClose={closeDialog}>
          <ResultList
            items={[
              { label: 'Jogador', value: dialog.purchase.player_name },
              { label: 'Valor', value: formatMoney(dialog.purchase.value) },
              { label: 'Taxa', value: formatMoney(dialog.purchase.fee) },
              { label: 'Custo total', value: formatMoney(dialog.purchase.value + dialog.purchase.fee) },
              { label: 'Fim da fidelidade', value: formatDateTime(dialog.purchase.contract.loyalty_until) },
              { label: 'Novo caixa', value: formatMoney(dialog.purchase.club_cash) },
            ]}
          />
          <div className="mt-5 flex justify-end">
            <Button onClick={closeDialog}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PlayersPage;
