import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { parseId } from '../common/parse-id';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Post()
  async play(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const match = await this.matches.play(body);
    res.setHeader('Location', `/api/v1/matches/${match.id}`);
    return match;
  }

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.matches.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matches.findOne(parseId(id));
  }
}
