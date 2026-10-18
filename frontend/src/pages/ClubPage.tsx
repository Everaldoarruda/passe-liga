import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getClub } from '../api/clubs';
import { sellPlayer } from '../api/market';
import type { Sale, SquadPlayer } from '../api/types';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ConditionBadge from '../components/ConditionBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { type Column } from '../components/DataTable';
import Modal from '../components/Modal';
import PlayerName from '../components/PlayerName';
import ResultList from '../components/ResultList';
import { useFetch } from '../hooks/useFetch';
import { useSubmit } from '../hooks/useSubmit';
import { formatDateTime, formatMoney } from '../lib/format';
import ClubTransactions from '../components/ClubTransactions';
import Tabs from '../components/Tabs';

function buildSquadColumns(onSell: (player: SquadPlayer) => void): Column<SquadPlayer>[] {
  return [
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
    {
      header: 'Ações',
      render: (player) => (
        <Button className="px-2 py-1 text-xs" onClick={() => onSell(player)}>
          Vender
        </Button>
      ),
    },
  ];
}
const CLUB_TABS = [
  { value: 'squad', label: 'Elenco' },
  { value: 'history', label: 'Histórico' },
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
  const { data: club, loading, error, reload } = useFetch(loadClub);
  const [dialog, setDialog] = useState<
    { type: 'sell'; player: SquadPlayer } | { type: 'sale'; sale: Sale } | null
  >(null);
  const { submitting, submit } = useSubmit();
  const closeDialog = () => setDialog(null);
  const squadColumns = buildSquadColumns((player) => setDialog({ type: 'sell', player }));
  const [tab, setTab] = useState('squad');
  const handleSell = async (player: SquadPlayer) => {
    const sale = await submit(
      () => sellPlayer(player.id),
      (result) => `${result.player_name} vendido.`,
    );
    if (sale === null) return;
    setDialog({ type: 'sale', sale });
    reload();
  };

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

      <div className="mt-6">
        <Tabs label="Seções do clube" options={CLUB_TABS} value={tab} onChange={setTab} />
      </div>
      <div className="mt-2 rounded-lg border border-gray-200 bg-white">
        {tab === 'squad' && (
          <DataTable
            columns={squadColumns}
            rows={club?.players ?? []}
            rowKey={(player) => player.id}
            loading={loading}
            error={error}
            emptyMessage="O clube ainda não tem jogadores."
          />
        )}
        {tab === 'history' && club && <ClubTransactions clubId={club.id} />}
      </div>

      {dialog?.type === 'sell' && (
        <ConfirmDialog
          title="Vender jogador"
          open
          confirmLabel="Vender"
          submitting={submitting}
          onConfirm={() => handleSell(dialog.player)}
          onClose={closeDialog}
        >
          Vender <strong>{dialog.player.name}</strong> pelo valor de mercado atual (
          {formatMoney(dialog.player.market_value)})?
        </ConfirmDialog>
      )}

      {dialog?.type === 'sale' && (
        <Modal title="Venda realizada" open onClose={closeDialog}>
          <ResultList
            items={[
              { label: 'Jogador', value: dialog.sale.player_name },
              { label: 'Valor de compra', value: formatMoney(dialog.sale.purchase_value) },
              { label: 'Valor de venda', value: formatMoney(dialog.sale.value) },
              { label: 'Dias restantes', value: dialog.sale.remaining_days },
              {
                label: 'Multa',
                value: `${formatMoney(dialog.sale.penalty)} (${dialog.sale.penalty_rate}%)`,
              },
              { label: 'Lucro', value: formatMoney(dialog.sale.profit ?? 0) },
              { label: 'Comissão', value: formatMoney(dialog.sale.fee) },
              { label: 'Crédito', value: formatMoney(dialog.sale.cash_change) },
              { label: 'Novo caixa', value: formatMoney(dialog.sale.club_cash) },
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

export default ClubPage;
