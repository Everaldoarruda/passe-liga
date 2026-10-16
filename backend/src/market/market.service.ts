import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Jogador, Prisma } from '@prisma/client';
import { formatBrasilia } from '../domain/brasilia-date';
import { marketValueCents, PlayerCondition } from '../domain/market-value';
import { formatMoney, fromCents, toCents } from '../domain/money';
import { isWithinCashLimit, purchaseFeeCents, remainingDays, settleSale } from '../domain/trade';
import { lockClub } from '../common/club-lock';
import { PrismaService } from '../prisma/prisma.service';
import { parseBuy } from './buy-input';

const SQUAD_LIMIT = 12;

const centsOf = (decimal: Prisma.Decimal): number => toCents(Number(decimal));

const marketCents = (player: Jogador): number =>
  marketValueCents(
    centsOf(player.valorBase),
    player.condicao as PlayerCondition,
    player.agilidade,
    player.idade,
  );

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async buy(playerId: number, body: unknown) {
    const now = new Date();
    const input = parseBuy(body, now);

    return this.prisma.$transaction(async (tx) => {
      const player = await tx.jogador.findFirst({ where: { id: playerId, excluidoEm: null } });
      if (!player) throw new NotFoundException('Jogador não encontrado.');
      await lockClub(tx, input.clubId);
      const club = await tx.clube.findUniqueOrThrow({ where: { id: input.clubId } });

      if (player.clubeId !== null) throw new ConflictException('O jogador não está livre.');

      const alreadySold = await tx.transacao.findFirst({
        where: { clubeId: club.id, jogadorId: player.id, tipo: 'VENDA' },
      });
      if (alreadySold) {
        throw new ConflictException('O clube não pode comprar um jogador que ele mesmo vendeu.');
      }

      const squadSize = await tx.jogador.count({ where: { clubeId: club.id, excluidoEm: null } });
      if (squadSize >= SQUAD_LIMIT) throw new ConflictException('O elenco já tem 12 jogadores.');

      const valueCents = marketCents(player);
      const feeCents = purchaseFeeCents(valueCents);
      const totalCents = valueCents + feeCents;
      const cashCents = centsOf(club.caixa);
      if (!isWithinCashLimit(totalCents, cashCents)) {
        throw new ConflictException(
          `O custo da compra (${formatMoney(totalCents)}) passa do limite de 50% do caixa (${formatMoney(cashCents / 2)}).`,
        );
      }

      const claimed = await tx.jogador.updateMany({
        where: { id: player.id, clubeId: null, excluidoEm: null },
        data: { clubeId: club.id },
      });
      if (claimed.count !== 1) throw new ConflictException('O jogador não está livre.');

      const newCashCents = cashCents - totalCents;
      await tx.clube.update({ where: { id: club.id }, data: { caixa: fromCents(newCashCents) } });
      await tx.contrato.create({
        data: {
          jogadorId: player.id,
          clubeId: club.id,
          valorCompra: fromCents(valueCents),
          fidelidadeAte: input.loyaltyUntil,
          situacao: 'ATIVO',
          iniciadoEm: now,
        },
      });
      const transaction = await tx.transacao.create({
        data: {
          clubeId: club.id,
          jogadorId: player.id,
          nomeJogador: player.nome,
          tipo: 'COMPRA',
          valor: fromCents(valueCents),
          taxa: fromCents(feeCents),
          multa: 0,
          lucro: null,
          variacaoCaixa: fromCents(-totalCents),
          criadoEm: now,
        },
      });

      return {
        id: transaction.id,
        club_id: club.id,
        player_id: player.id,
        player_name: player.nome,
        type: 'COMPRA',
        value: fromCents(valueCents),
        fee: fromCents(feeCents),
        penalty: 0,
        profit: null,
        cash_change: fromCents(-totalCents),
        created_at: formatBrasilia(now),
        contract: {
          purchase_value: fromCents(valueCents),
          loyalty_until: formatBrasilia(input.loyaltyUntil),
          status: 'ATIVO',
        },
        club_cash: fromCents(newCashCents),
      };
    });
  }

  async sell(playerId: number) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const player = await tx.jogador.findFirst({ where: { id: playerId, excluidoEm: null } });
      if (!player) throw new NotFoundException('Jogador não encontrado.');
      if (player.clubeId === null) {
        throw new ConflictException('Jogador livre não pode ser vendido.');
      }
      const clubId = player.clubeId;
      await lockClub(tx, clubId);
      const club = await tx.clube.findUniqueOrThrow({ where: { id: clubId } });

      const contract = await tx.contrato.findFirst({
        where: { jogadorId: player.id, clubeId: clubId, situacao: 'ATIVO' },
      });
      if (!contract) throw new ConflictException('O jogador não tem contrato ativo.');

      const valueCents = marketCents(player);
      const purchaseCents = centsOf(contract.valorCompra);
      const days = remainingDays(contract.fidelidadeAte, now);
      const sale = settleSale(valueCents, purchaseCents, days);

      const released = await tx.jogador.updateMany({
        where: { id: player.id, clubeId: clubId },
        data: { clubeId: null },
      });
      if (released.count !== 1) throw new ConflictException('O jogador mudou de clube.');
      await tx.escalacao.deleteMany({ where: { jogadorId: player.id } });

      const newCashCents = centsOf(club.caixa) + sale.creditCents;
      await tx.clube.update({ where: { id: clubId }, data: { caixa: fromCents(newCashCents) } });
      const contractStatus = sale.penaltyRate > 0 ? 'RESCINDIDO' : 'ENCERRADO';
      await tx.contrato.update({
        where: { id: contract.id },
        data: { situacao: contractStatus, encerradoEm: now },
      });
      const transaction = await tx.transacao.create({
        data: {
          clubeId: clubId,
          jogadorId: player.id,
          nomeJogador: player.nome,
          tipo: 'VENDA',
          valor: fromCents(valueCents),
          taxa: fromCents(sale.commissionCents),
          multa: fromCents(sale.penaltyCents),
          lucro: fromCents(sale.profitCents),
          variacaoCaixa: fromCents(sale.creditCents),
          criadoEm: now,
        },
      });

      return {
        id: transaction.id,
        club_id: clubId,
        player_id: player.id,
        player_name: player.nome,
        type: 'VENDA',
        value: fromCents(valueCents),
        fee: fromCents(sale.commissionCents),
        penalty: fromCents(sale.penaltyCents),
        profit: fromCents(sale.profitCents),
        cash_change: fromCents(sale.creditCents),
        created_at: formatBrasilia(now),
        purchase_value: fromCents(purchaseCents),
        remaining_days: sale.daysRemaining,
        penalty_rate: sale.penaltyRate,
        contract_status: contractStatus,
        club_cash: fromCents(newCashCents),
      };
    });
  }
}
