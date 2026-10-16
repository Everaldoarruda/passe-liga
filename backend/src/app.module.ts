import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { MarketModule } from './market/market.module';
import { LeagueModule } from './league/league.module';

@Module({
  imports: [PrismaModule, ClubsModule, PlayersModule, MarketModule, LeagueModule],
})
export class AppModule {}
