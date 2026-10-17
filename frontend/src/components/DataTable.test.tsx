import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DataTable, { type Column } from './DataTable';

interface Row {
  id: number;
  name: string;
}

const columns: Column<Row>[] = [{ header: 'Nome', render: (row) => row.name }];

const renderTable = (props: { rows?: Row[]; loading?: boolean; error?: string | null }) =>
  render(
    <DataTable
      columns={columns}
      rows={props.rows ?? []}
      rowKey={(row) => row.id}
      loading={props.loading ?? false}
      error={props.error ?? null}
      emptyMessage="Nada por aqui."
    />,
  );

describe('DataTable', () => {
  it('mostra o carregamento', () => {
    renderTable({ loading: true });
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('mostra o erro', () => {
    renderTable({ error: 'A API está fora do ar.' });
    expect(screen.getByText('A API está fora do ar.')).toBeInTheDocument();
  });

  it('mostra a mensagem de lista vazia', () => {
    renderTable({ rows: [] });
    expect(screen.getByText('Nada por aqui.')).toBeInTheDocument();
  });

  it('desenha uma linha por item', () => {
    renderTable({
      rows: [
        { id: 1, name: 'Ana Lima' },
        { id: 2, name: 'Bruno Reis' },
      ],
    });
    expect(screen.getByRole('cell', { name: 'Ana Lima' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Bruno Reis' })).toBeInTheDocument();
  });
});
