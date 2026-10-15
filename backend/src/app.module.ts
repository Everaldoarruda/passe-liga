import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [PrismaModule, ClubsModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
