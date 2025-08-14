// src/product-services/withdrawal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletType } from '~/common/enums/common.enum';
import { Withdrawal } from '~/entity/product-services/withdrawal.entity';
import { Wallet } from '~/entity/users';
import { TransactionService } from '~/transactions/services/transaction.service';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal) private wRepo: Repository<Withdrawal>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    private txService: TransactionService,
  ) {}

  // async requestWithdrawal(
  //   userId: string,
  //   amount: number,
  //   currency = 'BDT',
  //   method = 'bank',
  // ) {
  //   // find user wallet
  //   const userWallet = await this.walletRepo.findOne({
  //     where: { user: { id: userId } as any, walletType: WalletType.MONEY },
  //   });
  //   if (!userWallet) throw new NotFoundException('User wallet not found');

  //   // platform withdrawal holding wallet (system)
  //   // const holdingWallet = await this.walletRepo.findOne({
  //   //   where: { user: null, walletType: 'withdrawal_holding' as any },
  //   // });
  //   // if (!holdingWallet)
  //   //   throw new NotFoundException('Withdrawal holding wallet missing');

  //   // create withdrawal row
  //   const w = this.wRepo.create({
  //     user: { id: userId } as any,
  //     amount,
  //     currency,
  //     status: 'pending',
  //     method,
  //   });
  //   await this.wRepo.save(w);

  //   // create transaction: debit holding (liability) and credit user wallet (outflow from user)
  //   const tx = await this.txService.createTransactionWithJournal({
  //     userId,
  //     walletId: userWallet.id,
  //     type: 'withdrawal_request',
  //     valueType: 'money',
  //     amount,
  //     currency,
  //     direction: 'outflow',
  //     relatedService: 'withdrawal',
  //     relatedEntityId: w.id,
  //     metadata: { method },
  //     journalEntries: [
  //       { accountId: holdingWallet.id, debit: amount, credit: 0, currency },
  //       { accountId: userWallet.id, debit: 0, credit: amount, currency },
  //     ],
  //   });

  //   return { withdrawal: w, tx };
  // }
}
