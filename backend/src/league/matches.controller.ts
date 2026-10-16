import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiQueries } from '../common/api-docs';
import { parseId } from '../common/parse-id';
import { LIST_MATCHES_QUERIES, MATCH_BODY } from './league.docs';
import { MatchesService } from './matches.service';

@ApiTags('Liga')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Post()
  @ApiBody(MATCH_BODY)
  async play(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const match = await this.matches.play(body);
    res.setHeader('Location', `/api/v1/matches/${match.id}`);
    return match;
  }

  @Get()
  @ApiQueries(...LIST_MATCHES_QUERIES)
  list(@Query() query: Record<string, unknown>) {
    return this.matches.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matches.findOne(parseId(id));
  }
}
