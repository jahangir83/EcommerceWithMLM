import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private txService: TransactionService) {}

  @Get('history/:userId')
  async history(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '20',
    @Query('type') type?: string,
    @Query('valueType') valueType?: string,
    @Query('direction') direction?: string,
    @Query('includeJournal') includeJournal?: string,
  ) {
    const f: any = {};
    if (type) f.type = type;
    if (valueType) f.valueType = valueType;
    if (direction) f.direction = direction;
    const include = includeJournal === 'true';
    return this.txService.getTransactionHistory(
      userId,
      f,
      Number(page),
      Number(perPage),
      include,
    );
  }

  @Get('flow/:txId')
  async flow(@Param('txId') txId: string) {
    return this.txService.getTransactionFlow(txId);
  }
}
