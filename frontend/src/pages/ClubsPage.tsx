import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { createClub, listClubs, type ClubCreate } from '../api/clubs';
import type { Club } from '../api/types';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ClubForm from '../components/ClubForm';
import DataTable, { type Column } from '../components/DataTable';
import Modal from '../components/Modal';
import Tabs from '../components/Tabs';
import { useFetch } from '../hooks/useFetch';
import { useSubmit } from '../hooks/useSubmit';
import { formatMoney } from '../lib/format';

const SORT_TABS = [
  { value: 'name', label: 'Nome' },
  { value: 'net_worth_desc', label: 'Maior patrimônio' },
  { value: 'net_worth_asc', label: 'Menor patrimônio' },
];

const columns: Column<Club>[] = [
  {
    header: 'Clube',
    render: (club) => (
      <Link to={`/clubs/${club.id}`} className="font-medium text-gray-900 underline">
        {club.name}
      </Link>
    ),
  },
  { header: 'Sigla', render: (club) => <Badge>{club.acronym}</Badge> },
  { header: 'Caixa', align: 'right', render: (club) => formatMoney(club.cash) },
  { header: 'Valor do elenco', align: 'right', render: (club) => formatMoney(club.squad_value) },
  { header: 'Patrimônio', align: 'right', render: (club) => <strong>{formatMoney(club.net_worth)}</strong> },
];

function ClubsPage() {
  const [sort, setSort] = useState('name');
  const loadClubs = useCallback(() => listClubs(sort), [sort]);
  const { data, loading, error, reload } = useFetch(loadClubs);
  const [formOpen, setFormOpen] = useState(false);
  const { submitting, submit } = useSubmit();

  const handleCreate = async (values: ClubCreate) => {
    const created = await submit(
      () => createClub(values),
      (club) => `${club.name} criado, com caixa de ${formatMoney(club.cash)}.`,
    );
    if (!created) return;
    setFormOpen(false);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Clubes</h1>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          + Novo clube
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 text-sm text-gray-600">
          <span>Ordenar por</span>
          <Tabs label="Ordenar clubes" options={SORT_TABS} value={sort} onChange={setSort} />
        </div>
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(club) => club.id}
          loading={loading}
          error={error}
          emptyMessage="Nenhum clube cadastrado."
        />
      </div>

      <Modal title="Novo clube" open={formOpen} onClose={() => setFormOpen(false)}>
        <ClubForm submitting={submitting} onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}

export default ClubsPage;
