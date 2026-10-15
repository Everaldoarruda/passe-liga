import { fail } from '../common/fail';
import { compareNames } from '../common/text';

export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc';

const SORT_OPTIONS: readonly ClubSort[] = ['name', 'net_worth_asc', 'net_worth_desc'];

interface Sortable {
  id: number;
  name: string;
  net_worth: number;
}

export function parseClubSort(query: Record<string, unknown>): ClubSort {
  const raw = query.sort;
  if (raw === undefined) return 'name';
  if (typeof raw !== 'string' || !SORT_OPTIONS.includes(raw as ClubSort)) {
    return fail('O parâmetro sort deve ser name, net_worth_asc ou net_worth_desc.');
  }
  return raw as ClubSort;
}

export function sortClubs<T extends Sortable>(clubs: T[], sort: ClubSort): T[] {
  return [...clubs].sort((a, b) => {
    if (sort !== 'name') {
      const difference = a.net_worth - b.net_worth;
      if (difference !== 0) return sort === 'net_worth_asc' ? difference : -difference;
    }
    return compareNames(a.name, b.name) || a.id - b.id;
  });
}