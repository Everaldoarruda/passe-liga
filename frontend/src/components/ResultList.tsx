import type { ReactNode } from 'react';

interface ResultItem {
  label: string;
  value: ReactNode;
}

function ResultList({ items }: { items: ResultItem[] }) {
  return (
    <dl className="divide-y divide-gray-100 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between py-1.5">
          <dt className="text-gray-500">{item.label}</dt>
          <dd className="font-medium text-gray-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default ResultList;
