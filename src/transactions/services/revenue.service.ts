import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionService } from './transaction.service';
import { RevenueShare } from '~/entity/transactions/revenue.share.entity';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(RevenueShare)
    private revenueRepo: Repository<RevenueShare>,
    private txService: TransactionService,
  ) {}

  // pay a pending revenue share by creating journal entries (debit platform, credit recipient)
  async payRevenueShare(
    revenueShareId: string,
    platformAccountId: string,
    recipientWalletId: string,
    currency = 'BDT',
  ) {
    const rs = await this.revenueRepo.findOne({
      where: { id: revenueShareId },
      relations: ['recipientUser', 'transaction'],
    });
    if (!rs) throw new Error('RevenueShare not found');
    if (rs.status === 'paid') throw new Error('Already paid');

    // create transaction: debit platform, credit recipient
    const tx = await this.txService.createTransactionWithJournal({
      userId: rs.recipientUser.id,
      type: 'commission_payout',
      valueType: 'money',
      amount: Number(rs.amount),
      currency,
      direction: 'inflow',
      relatedService: 'revenue_share',
      relatedEntityId: rs.id,
      metadata: {
        generation: rs.generationLevel,
        originTransaction: rs.transaction.id,
      },
      journalEntries: [
        { accountId: recipientWalletId, debit: rs.amount, credit: 0, currency },
        { accountId: platformAccountId, debit: 0, credit: rs.amount, currency },
      ],
    });

    rs.status = 'paid';
    await this.revenueRepo.save(rs);
    return tx;
  }
}
