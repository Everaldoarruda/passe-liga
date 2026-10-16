import { Injectable } from '@nestjs/common';
import { buildStandings } from '../domain/standings';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const [clubs, matches] = await Promise.all([
      this.prisma.clube.findMany(),
      this.prisma.partida.findMany(),
    ]);

    const rows = buildStandings(
      clubs.map((club) => ({ id: club.id, name: club.nome })),
      matches.map((match) => ({
        homeId: match.mandanteId,
        awayId: match.visitanteId,
        homeGoals: match.golsMandante,
        awayGoals: match.golsVisitante,
      })),
    );

    return rows.map((row) => ({
      position: row.position,
      club_id: row.clubId,
      club_name: row.clubName,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goals_for: row.goalsFor,
      goals_against: row.goalsAgainst,
      goal_difference: row.goalDifference,
      points: row.points,
    }));
  }
}
