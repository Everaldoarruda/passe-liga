import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { parseId } from '../common/parse-id';
import { LineupService } from './lineup.service';

@Controller('clubs')
export class LineupController {
  constructor(private readonly lineup: LineupService) {}

  @Get(':id/lineup')
  get(@Param('id') id: string) {
    return this.lineup.get(parseId(id));
  }

  @Put(':id/lineup')
  replace(@Param('id') id: string, @Body() body: unknown) {
    return this.lineup.replace(parseId(id), body);
  }
}