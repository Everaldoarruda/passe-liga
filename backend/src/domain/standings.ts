import { compareNames } from '../common/text';

export interface StandingClub {
  id: number;
  name: string;
}

export interface PlayedMatch {
  homeId: number;
  awayId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface StandingRow {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

type Tally = Omit<StandingRow, 'position' | 'goalDifference'>;

function register(tally: Tally, scored: number, conceded: number): void {
  tally.played += 1;
  tally.goalsFor += scored;
  tally.goalsAgainst += conceded;
  if (scored > conceded) {
    tally.wins += 1;
    tally.points += 3;
  } else if (scored === conceded) {
    tally.draws += 1;
    tally.points += 1;
  } else {
    tally.losses += 1;
  }
}

// Mais pontos, maior saldo, mais gols marcados, nome (ordem alfabética) e id
export function buildStandings(clubs: StandingClub[], matches: PlayedMatch[]): StandingRow[] {
  const tallies = new Map<number, Tally>(
    clubs.map((club): [number, Tally] => [
      club.id,
      { clubId: club.id, clubName: club.name, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]),
  );

  for (const match of matches) {
    const home = tallies.get(match.homeId);
    const away = tallies.get(match.awayId);
    if (home) register(home, match.homeGoals, match.awayGoals);
    if (away) register(away, match.awayGoals, match.homeGoals);
  }

  return [...tallies.values()]
    .map((tally) => ({ ...tally, goalDifference: tally.goalsFor - tally.goalsAgainst }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        compareNames(a.clubName, b.clubName) ||
        a.clubId - b.clubId,
    )
    .map((row, index) => ({ position: index + 1, ...row }));
}