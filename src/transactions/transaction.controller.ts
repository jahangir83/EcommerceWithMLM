import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { FinancialOrchestratorService } from './services/financial-orchestrator.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private txService: TransactionService,
        private financialOrchestrator: FinancialOrchestratorService,

  ) {}

   @Get("history/:userId")
  async history(
    userId: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '20',
    @Query('type') type?: string,
    @Query('valueType') valueType?: string,
    @Query('direction') direction?: string,
    @Query('includeJournal') includeJournal?: string,
  ) {
    const f: any = {}
    if (type) f.type = type
    if (valueType) f.valueType = valueType
    if (direction) f.direction = direction
    const include = includeJournal === "true"
    return this.txService.getTransactionHistory(userId, f, Number(page), Number(perPage), include)
  }

  @Get("flow/:txId")
  async flow(txId: string) {
    return this.txService.getTransactionFlow(txId)
  }

  @Post("process-order-payment/:paymentId")
  async processOrderPayment(paymentId: string) {
    return this.financialOrchestrator.processOrderPayment(paymentId)
  }

  @Post('process-pending-commissions')
  async processPendingCommissions(@Body('limit') limit?: number) {
    return this.financialOrchestrator.processPendingCommissions(limit || 100);
  }

  @Get("financial-summary")
  async getFinancialSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.financialOrchestrator.getFinancialSummary(start, end)
  }
}
