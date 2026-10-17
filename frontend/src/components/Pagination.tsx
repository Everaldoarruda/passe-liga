import Button from './Button';

interface PaginationProps {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

function Pagination({ page, limit, totalItems, totalPages, itemLabel, onPageChange }: PaginationProps) {
  const first = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm text-gray-600">
      <span>
        Mostrando {first}–{last} de {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        {pages.map((number) => (
          <Button
            key={number}
            variant={number === page ? 'primary' : 'secondary'}
            aria-current={number === page ? 'page' : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </Button>
        ))}
        <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
