import { ListOrdered } from 'lucide-react';
import { Link } from 'react-router';
import { listStandings } from '../api/league';
import type { Standing } from '../api/types';
import DataTable, { type Column } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useFetch } from '../hooks/useFetch';
import { formatSigned } from '../lib/format';

const columns: Column<Standing>[] = [
  { header: 'Posição', align: 'right', render: (row) => `${row.position}º` },
  {
    header: 'Clube',
    render: (row) => (
      <Link to={`/clubs/${row.club_id}`} className="font-medium text-gray-900 underline">
        {row.club_name}
      </Link>
    ),
  },
  { header: 'Jogos', align: 'right', render: (row) => row.played },
  { header: 'Vitórias', align: 'right', render: (row) => row.wins },
  { header: 'Empates', align: 'right', render: (row) => row.draws },
  { header: 'Derrotas', align: 'right', render: (row) => row.losses },
  { header: 'Gols marcados', align: 'right', render: (row) => row.goals_for },
  { header: 'Gols sofridos', align: 'right', render: (row) => row.goals_against },
  { header: 'Saldo', align: 'right', render: (row) => formatSigned(row.goal_difference) },
  { header: 'Pontos', align: 'right', render: (row) => <strong>{row.points}</strong> },
];

function StandingsPage() {
  const { data, loading, error } = useFetch(listStandings);

  return (
    <div>
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        subtitle="Vitória vale 3 pontos e empate 1. Desempate pelo saldo, pelos gols marcados e pelo nome."
      />
      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.club_id}
          loading={loading}
          error={error}
          emptyMessage="Nenhum clube cadastrado."
        />
      </div>
    </div>
  );
}

export default StandingsPage;
