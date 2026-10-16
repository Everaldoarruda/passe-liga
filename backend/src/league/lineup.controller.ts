import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { parseId } from '../common/parse-id';
import { LINEUP_BODY } from './league.docs';
import { LineupService } from './lineup.service';

@ApiTags('Liga')
@Controller('clubs')
export class LineupController {
  constructor(private readonly lineup: LineupService) {}

  @Get(':id/lineup')
  get(@Param('id') id: string) {
    return this.lineup.get(parseId(id));
  }

  @Put(':id/lineup')
  @ApiBody(LINEUP_BODY)
  replace(@Param('id') id: string, @Body() body: unknown) {
    return this.lineup.replace(parseId(id), body);
  }
}
