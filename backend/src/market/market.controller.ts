import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { parseId } from '../common/parse-id';
import { BUY_BODY } from './market.docs';
import { MarketService } from './market.service';

@ApiTags('Mercado')
@Controller('players')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Post(':id/buy')
  @ApiBody(BUY_BODY)
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
