import { useCallback, useState } from 'react';
import { listTransactions, transactionsCsvUrl, type TransactionFilters } from '../api/market';
import type { Transaction } from '../api/types';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime, formatMoney, formatSignedMoney } from '../lib/format';
import { TRANSACTION_TYPE_NAMES } from '../lib/labels';
import Badge from './Badge';
import DataTable, { type Column } from './DataTable';
import Field, { inputClass } from './Field';
import ResultList from './ResultList';

const NO_FILTERS: TransactionFilters = { type: '', player_id: '' };
const TYPES = ['COMPRA', 'VENDA'] as const;

const columns: Column<Transaction>[] = [
  { header: 'Data e hora', render: (item) => formatDateTime(item.created_at) },
  { header: 'Tipo', render: (item) => <Badge>{TRANSACTION_TYPE_NAMES[item.type]}</Badge> },
  { header: 'Jogador', render: (item) => item.player_name },
  { header: 'Valor', align: 'right', render: (item) => formatMoney(item.value) },
  { header: 'Taxa ou comissão', align: 'right', render: (item) => formatMoney(item.fee) },
  { header: 'Multa', align: 'right', render: (item) => formatMoney(item.penalty) },
  {
    header: 'Lucro',
    align: 'right',
    render: (item) => (item.profit === null ? '—' : formatSignedMoney(item.profit)),
  },
  {
    header: 'Variação do caixa',
    align: 'right',
    render: (item) => (
      <strong className={item.cash_change < 0 ? 'text-red-600' : 'text-green-700'}>
        {formatSignedMoney(item.cash_change)}
      </strong>
    ),
  },
];

function ClubTransactions({ clubId }: { clubId: number }) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const loadHistory = useCallback(() => listTransactions(clubId, filters), [clubId, filters]);
  const { data, loading, error } = useFetch(loadHistory);
  const loadAll = useCallback(() => listTransactions(clubId, NO_FILTERS), [clubId]);
  const { data: all } = useFetch(loadAll);

  const selectedTypes = filters.type ? filters.type.split(',') : [];
  const players = new Map(all?.data.map((item) => [item.player_id, item.player_name]));

  const toggleType = (type: string) => {
    const next = TYPES.filter((option) =>
      option === type ? !selectedTypes.includes(option) : selectedTypes.includes(option),
    );
    setFilters((current) => ({ ...current, type: next.join(',') }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 border-b border-gray-200 p-3">
        <fieldset className="flex items-center gap-3 text-sm">
          <legend className="mb-1 text-sm font-medium text-gray-700">Tipo</legend>
          {TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
              />
              {TRANSACTION_TYPE_NAMES[type]}
            </label>
          ))}
        </fieldset>
        <div className="w-56">
          <Field label="Jogador" htmlFor="history-player">
            <select
              id="history-player"
              className={inputClass}
              value={filters.player_id}
              onChange={(event) => setFilters((current) => ({ ...current, player_id: event.target.value }))}
            >
              <option value="">Todos</option>
              {[...players].map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <a
          href={transactionsCsvUrl(clubId, filters)}
          className="ml-auto rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Exportar CSV
        </a>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyMessage="Nenhuma transação encontrada."
      />

      {data && !loading && !error && (
        <div className="border-t border-gray-200 p-3">
          <ResultList
            items={[
              { label: 'Total pago em compras', value: formatMoney(data.summary.total_spent) },
              { label: 'Total recebido em vendas', value: formatMoney(data.summary.total_received) },
              { label: 'Total de taxas e comissões', value: formatMoney(data.summary.total_fees) },
              { label: 'Total de multas', value: formatMoney(data.summary.total_penalties) },
              { label: 'Lucro total', value: formatSignedMoney(data.summary.total_profit) },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default ClubTransactions;
