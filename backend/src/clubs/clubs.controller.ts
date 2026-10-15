import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { parseId } from '../common/parse-id';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.clubs.list(query);
  }

  @Post()
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