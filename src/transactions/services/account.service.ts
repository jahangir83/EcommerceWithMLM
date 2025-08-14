import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '~/entity/users';
import { AccountBalance } from '~/entity/users/account-balance.entity';
import { WalletType } from '~/common/enums/common.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(AccountBalance)
    private balanceRepo: Repository<AccountBalance>,
  ) {}

  async findOrCreateUserWallet(
    userId: string,
    walletType: WalletType,
    currency = 'BDT',
  ) {
    let w = await this.walletRepo.findOne({
      where: { user: { id: userId }, walletType },
    });
    if (!w) {
      w = this.walletRepo.create({
        user: { id: userId } as any,
        walletType,
        balance: 0,
        currency,
      });
      w = await this.walletRepo.save(w);
      await this.balanceRepo.save(
        this.balanceRepo.create({
          account: { id: w.id } as any,
          balance: 0,
          currency,
        }),
      );
    }
    return w;
  }

  async getWalletBalance(walletId: string) {
    return this.balanceRepo.findOne({
      where: { account: { id: walletId } as any },
    });
  }
}
