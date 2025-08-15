import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  TransactionType,
  ValueType,
  WalletType,
} from '~/common/enums/common.enum';
import { TransactionService } from '~/transactions/services/transaction.service';
import { AccountService } from '~/transactions/services/account.service';
import { Order, OrderStatus } from '~/orders/entities/order.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private txService: TransactionService,
    private accountService: AccountService,
  ) {}

  async purchaseWithWallet(
    buyerId: string,
    productId: string,
    quantity: number,
    totalAmount: number,
    currency = 'BDT',
  ) {
    // const order = this.orderRepo.create({
    //   user: { id: buyerId } as any,
    //   productId,
    //   quantity,
    //   totalAmount,
    //   status: OrderStatus.PENDING_PAYMENT,
    // });
    // await this.orderRepo.save(order);

    // const buyerWallet = await this.accountService.findOrCreateUserWallet(
    //   buyerId,
    //   WalletType.MONEY,
    //   currency,
    // );
    // // ensure platform wallet exists - it's a system-level wallet with no user
    // //TODO: We need to ensure platform wallet is created only once
    // const platformWallet = await this.accountService.findOrCreateUserWallet(
    //   null as any,
    //   WalletType.MONEY,
    //   currency,
    // );

    // // create transaction: buyer pays -> platform receives
    // const tx = await this.txService.createTransactionWithJournal({
    //   userId: buyerId,
    //   walletId: buyerWallet.id,
    //   type: TransactionType.PURCHASE,
    //   valueType: ValueType.MONEY,
    //   amount: totalAmount,
    //   currency,
    //   direction: 'outflow',
    //   relatedService: 'product_purchase',
    //   relatedEntityId: order.id,
    //   metadata: { productId, quantity },
    //   journalEntries: [
    //     {
    //       accountId: platformWallet.id,
    //       debit: totalAmount,
    //       credit: 0,
    //       currency,
    //     },
    //     { accountId: buyerWallet.id, debit: 0, credit: totalAmount, currency },
    //   ],
    // });

    // // mark order completed
    // order.status = OrderStatus.COMPLETED;
    // await this.orderRepo.save(order);

    // return { order, tx };
  }
}
