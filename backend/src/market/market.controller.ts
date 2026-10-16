import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { parseId } from '../common/parse-id';
import { MarketService } from './market.service';

@Controller('players')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Post(':id/buy')
  @HttpCode(200)
  buy(@Param('id') id: string, @Body() body: unknown) {
    return this.market.buy(parseId(id), body);
  }

  @Post(':id/sell')
  @HttpCode(200)
  sell(@Param('id') id: string) {
    return this.market.sell(parseId(id));
  }
}
