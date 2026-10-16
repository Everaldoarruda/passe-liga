import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StandingsService } from './standings.service';

@ApiTags('Liga')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standings: StandingsService) {}

  @Get()
  list() {
    return this.standings.list();
  }
}
