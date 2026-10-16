import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiQueries } from '../common/api-docs';
import { parseId } from '../common/parse-id';
import { CREATE_CLUB_BODY, LIST_CLUBS_QUERIES } from './clubs.docs';
import { ClubsService } from './clubs.service';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @ApiQueries(...LIST_CLUBS_QUERIES)
  list(@Query() query: Record<string, unknown>) {
    return this.clubs.list(query);
  }

  @Post()
  @ApiBody(CREATE_CLUB_BODY)
  async create(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const club = await this.clubs.create(body);
    res.setHeader('Location', `/api/v1/clubs/${club.id}`);
    return club;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubs.findOne(parseId(id));
  }
}
