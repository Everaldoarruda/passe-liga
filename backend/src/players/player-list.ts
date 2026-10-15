import { normalizeForComparison } from '../common/text';
import { toCents } from '../domain/money';
import type { ListPlayersQuery, SortCriterion, SortField } from './list-players-query';
import { POSITIONS } from '../domain/player-enums';
import type { PlayerResponse } from './player.presenter';

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function compareBy(field: SortField, a: PlayerResponse, b: PlayerResponse): number {
  switch (field) {
    case 'name':
      return compareText(normalizeForComparison(a.name), normalizeForComparison(b.name));
    case 'value':
      return a.market_value - b.market_value;
    case 'age':
      return a.age - b.age;
    case 'position':
      return POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position);
  }
}

// Critérios pedidos, depois nome e, por fim, id crescente (RN07)
function byCriteria(criteria: SortCriterion[]) {
  const all: SortCriterion[] = [...criteria, { field: 'name', descending: false }];
  return (a: PlayerResponse, b: PlayerResponse): number => {
    for (const { field, descending } of all) {
      const result = compareBy(field, a, b);
      if (result !== 0) return descending ? -result : result;
    }
    return a.id - b.id;
  };
}

export function listPlayers(players: PlayerResponse[], query: ListPlayersQuery) {
  const search = query.search === undefined ? undefined : normalizeForComparison(query.search);

  const matching = players
    .filter((p) => search === undefined || normalizeForComparison(p.name).includes(search))
    .filter((p) => {
      const cents = toCents(p.market_value);
      return cents >= query.minValueCents && cents <= query.maxValueCents;
    })
    .sort(byCriteria(query.sort));

  const start = (query.page - 1) * query.limit;
  return { data: matching.slice(start, start + query.limit), totalItems: matching.length };
}