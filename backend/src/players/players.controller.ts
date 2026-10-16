import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiQueries } from '../common/api-docs';
import { parseId } from '../common/parse-id';
import {
  CHANGE_CONDITION_BODY,
  CREATE_PLAYER_BODY,
  LIST_PLAYERS_QUERIES,
  UPDATE_PLAYER_BODY,
} from './players.docs';
import { PlayersService } from './players.service';

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  @ApiBody(CREATE_PLAYER_BODY)
  async create(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const player = await this.players.create(body);
    res.setHeader('Location', `/api/v1/players/${player.id}`);
    return player;
  }

  @Get()
  @ApiQueries(...LIST_PLAYERS_QUERIES)
  list(@Query() query: Record<string, unknown>) {
    return this.players.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.players.findOne(parseId(id));
  }

  @Put(':id')
  @ApiBody(UPDATE_PLAYER_BODY)
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.players.update(parseId(id), body);
  }

  @Patch(':id/condition')
  @ApiBody(CHANGE_CONDITION_BODY)
  changeCondition(@Param('id') id: string, @Body() body: unknown) {
    return this.players.changeCondition(parseId(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.players.remove(parseId(id));
  }
}
