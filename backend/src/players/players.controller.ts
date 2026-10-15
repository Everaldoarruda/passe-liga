import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { parseId } from '../common/parse-id';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  async create(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const player = await this.players.create(body);
    res.setHeader('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.players.findOne(parseId(id));
  }
}