import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '~/entity/transactions/transaction.entity';
import { JournalEntry } from '~/entity/transactions/journal.entity';
import { User, Wallet } from '~/entity/users';
import { AccountBalance } from '~/entity/users/account-balance.entity';
import { RevenueShare } from '~/entity/transactions/revenue.share.entity';
import { TransactionStatus, WalletType } from '~/common/enums/common.enum';

@Injectable()
export class TransactionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(JournalEntry)
    private journalRepo: Repository<JournalEntry>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(AccountBalance)
    private balanceRepo: Repository<AccountBalance>,
    @InjectRepository(RevenueShare)
    private revenueRepo: Repository<RevenueShare>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Create a transaction with journal entries and update balances atomically
  async createTransactionWithJournal(dto: any) {
    if (!dto.amount || dto.amount <= 0)
      throw new BadRequestException('Invalid amount');

    let user: User | null = null;
    // user exists?
    if (dto.userId) {
      user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException(`User ${dto.userId} not found`);
    }

    let wallet: Wallet | null = null;
    // Validate wallet if provided
    if (dto.walletId) {
      wallet = await this.walletRepo.findOne({ where: { id: dto.walletId } });
      if (!wallet)
        throw new NotFoundException(`Wallet ${dto.walletId} not found`);
      if (wallet.user.id !== user?.id)
        throw new BadRequestException('Wallet does not belong to the user');
    }

    return this.dataSource.transaction(async (manager) => {
      const tx = manager.create(Transaction, {
        User: dto.userId ? user : undefined,
        Wallet: dto.walletId ? wallet : undefined,
        type: dto.type,
        valueType: dto.valueType,
        amount: dto.amount,
        currency: dto.currency,
        direction: dto.direction,
        relatedService: dto.relatedService,
        relatedEntityId: dto.relatedEntityId,
        metadata: dto.metadata,
        status: TransactionStatus.COMPLETED,
        oldBalance: dto.oldBalance ?? null,
        newBalance: dto.newBalance ?? null,
      });
      const savedTx = await manager.save(tx);

      if (dto.journalEntries && dto.journalEntries.length) {
        const totalDebit = dto.journalEntries.reduce(
          (s, e) => s + (e.debit ?? 0),
          0,
        );
        const totalCredit = dto.journalEntries.reduce(
          (s, e) => s + (e.credit ?? 0),
          0,
        );
        if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
          throw new BadRequestException('Journal entries do not balance');
        }

        for (const je of dto.journalEntries) {
          const account = await manager.findOne(Wallet, {
            where: { id: je.accountId },
          });
          if (!account)
            throw new NotFoundException(
              `Wallet/Account ${je.accountId} not found`,
            );

          const entry = manager.create(JournalEntry, {
            transaction: savedTx,
            account,
            debit: je.debit ?? 0,
            credit: je.credit ?? 0,
            currency: je.currency,
          });
          await manager.save(entry);

          // balance delta for the wallet: delta = debit - credit
          const delta = Number(je.debit ?? 0) - Number(je.credit ?? 0);

          // Update the Wallet balance and AccountBalance snapshot
          // Update Wallet table directly
          account.balance = Number(account.balance) + delta;
          await manager.save(account);

          // Update AccountBalance snapshot
          const balRepo = manager.getRepository(AccountBalance);
          let bal = await balRepo.findOne({
            where: { account: { id: account.id } as any },
          });
          if (!bal) {
            bal = balRepo.create({
              account: { id: account.id } as any,
              balance: account.balance,
              currency: je.currency,
            });
          } else {
            bal.balance = account.balance;
          }
          await balRepo.save(bal);
        }
      }

      return savedTx;
    });
  }

  // Simple transfer helper (from wallet -> to wallet)
  async createSimpleTransfer(opts: {
    userId?: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: string;
    type: string;
    valueType: string;
    relatedService?: string;
    relatedEntityId?: string;
    metadata?: any;
  }) {
    const dto = {
      userId: opts.userId,
      walletId: opts.fromAccountId,
      type: opts.type,
      valueType: opts.valueType,
      amount: opts.amount,
      currency: opts.currency,
      direction: 'outflow',
      relatedService: opts.relatedService,
      relatedEntityId: opts.relatedEntityId,
      metadata: opts.metadata,
      journalEntries: [
        {
          accountId: opts.toAccountId,
          debit: opts.amount,
          credit: 0,
          currency: opts.currency,
        },
        {
          accountId: opts.fromAccountId,
          debit: 0,
          credit: opts.amount,
          currency: opts.currency,
        },
      ],
    };
    return this.createTransactionWithJournal(dto);
  }

  async getTransactionHistory(
    userId: string,
    filter: any = {},
    page = 1,
    perPage = 20,
    includeJournal = false,
  ) {
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .where('tx.userId = :userId', { userId })
      .orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    if (filter.type) qb.andWhere('tx.type = :type', { type: filter.type });
    if (filter.valueType)
      qb.andWhere('tx.valueType = :valueType', { valueType: filter.valueType });
    if (filter.direction)
      qb.andWhere('tx.direction = :direction', { direction: filter.direction });
    if (filter.status)
      qb.andWhere('tx.status = :status', { status: filter.status });

    if (includeJournal)
      qb.leftJoinAndSelect('tx.journalEntries', 'je').leftJoinAndSelect(
        'je.account',
        'a',
      );

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, perPage };
  }

  async getTransactionFlow(transactionId: string) {
    const entries = await this.journalRepo.find({
      where: { transaction: { id: transactionId } as any },
      relations: ['account'],
    });
    const from = entries
      .filter((e) => Number(e.credit) > 0)
      .map((e) => ({
        accountId: e.account.id,
        accountName: e.account.walletType,
        amount: Number(e.credit),
      }));
    const to = entries
      .filter((e) => Number(e.debit) > 0)
      .map((e) => ({
        accountId: e.account.id,
        accountName: e.account.walletType,
        amount: Number(e.debit),
      }));
    return { from, to, entries };
  }

  // Revenue share creation (only creates rows; paying them is separate)
  async distributeGenerationRevenue(
  originUserId: string,
  transactionId: string,
  generationPayouts: number[] = [10, 8, 7, 6, 5, 4, 3, 2, 1, 1],
) {
  let current = await this.userRepo.findOne({
    where: { id: originUserId },
    relations: ['referredBy'],
  });
  if (!current) throw new NotFoundException('Origin user not found');

  const tx = await this.txRepo.findOne({ where: { id: transactionId } });
  if (!tx) throw new NotFoundException('Transaction not found');

  const totalAmount = tx.amount;
  const shares: RevenueShare[] = [];

  for (let i = 0; i < generationPayouts.length; i++) {
    if (!current?.referredBy) break; // Stop if no more uplines
    const recipient = current.referredBy;

    const payoutAmount = (totalAmount * generationPayouts[i]) / 100;

    const rs = this.revenueRepo.create({
      transaction: tx,
      recipientUser: recipient,
      generationLevel: i + 1,
      amount: payoutAmount,
      status: 'pending',
    });
    shares.push(rs);

    // Move to next upline
    current = await this.userRepo.findOne({
      where: { id: recipient.id },
      relations: ['referredBy'],
    });
  }

  // Save all shares
  return await this.revenueRepo.save(shares);
}


  // pay a RevenueShare: create journal entry debit platform -> credit recipient
  async payRevenueShare(revenueShareId: string, platformWalletId: string) {
    const rs = await this.revenueRepo.findOne({
      where: { id: revenueShareId },
      relations: ['recipientUser', 'transaction'],
    });
    if (!rs) throw new NotFoundException('RevenueShare not found');
    if (rs.status === 'paid')
      throw new BadRequestException('RevenueShare already paid');

    // find recipient wallet (money wallet)
    const recipientWallet = await this.walletRepo.findOne({
      where: {
        user: { id: rs.recipientUser.id },
        walletType: WalletType.MONEY,
      },
    });
    if (!recipientWallet)
      throw new NotFoundException('Recipient wallet not found');

    const tx = await this.createTransactionWithJournal({
      userId: rs.recipientUser.id,
      walletId: recipientWallet.id,
      type: 'commission_payout',
      valueType: 'money',
      amount: Number(rs.amount),
      currency: 'BDT',
      direction: 'inflow',
      relatedService: 'revenue_share',
      relatedEntityId: rs.id,
      metadata: {
        generation: rs.generationLevel,
        originTransaction: rs.transaction.id,
      },
      journalEntries: [
        {
          accountId: recipientWallet.id,
          debit: Number(rs.amount),
          credit: 0,
          currency: 'BDT',
        },
        {
          accountId: platformWalletId,
          debit: 0,
          credit: Number(rs.amount),
          currency: 'BDT',
        },
      ],
    });

    rs.status = 'paid';
    await this.revenueRepo.save(rs);
    return tx;
  }
}
