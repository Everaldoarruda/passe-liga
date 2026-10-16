import { Module } from '@nestjs/common';
import { LineupController } from './lineup.controller';
import { LineupService } from './lineup.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';

@Module({
  controllers: [LineupController, MatchesController, StandingsController],
  providers: [LineupService, MatchesService, StandingsService],
})
export class LeagueModule {}
