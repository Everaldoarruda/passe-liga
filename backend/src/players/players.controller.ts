import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
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

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.players.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.players.findOne(parseId(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.players.update(parseId(id), body);
  }

  @Patch(':id/condition')
  changeCondition(@Param('id') id: string, @Body() body: unknown) {
    return this.players.changeCondition(parseId(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.players.remove(parseId(id));
  }
}
