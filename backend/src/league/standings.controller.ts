import { Controller, Get } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
  constructor(private readonly standings: StandingsService) {}

  @Get()
  list() {
    return this.standings.list();
  }
}