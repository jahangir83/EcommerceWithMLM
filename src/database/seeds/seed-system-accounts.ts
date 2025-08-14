// scripts/seed-system-accounts.ts
import { DataSource } from 'typeorm';

import bcrypt from 'bcrypt';
import { User } from '~/entity';
import { Wallet } from '~/entity/users/wallet.entity';

export async function runSeed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const walletRepo = dataSource.getRepository(Wallet);

  // create admin/system user
  let admin = await userRepo.findOneBy({ email: 'admin@example.com' });
  if (!admin) {
    admin = userRepo.create({
      name: 'Admin',
      email: 'admin@example.com',
      phone: '0000000000',
      password: await bcrypt.hash('password', 10),
    });
    await userRepo.save(admin);
  }

  // create platform wallet (system-level, user = null)
  // let platform = await walletRepo.findOne({
  //   where: { user: null as any, walletType: 'platform_revenue' },
  // });
  // if (!platform) {
  //   platform = walletRepo.create({
  //     user: null as any,
  //     balance: 0,
  //     walletType: 'platform_revenue',
  //     currency: 'BDT',
  //     isActive: true,
  //   });
  //   await walletRepo.save(platform);
  // }

  // withdrawal holding wallet
  // let holding = await walletRepo.findOne({
  //   where: { user: null as any, walletType: 'withdrawal_holding' },
  // });
  // if (!holding) {
  //   holding = walletRepo.create({
  //     user: null as any,
  //     balance: 0,
  //     walletType: 'withdrawal_holding',
  //     currency: 'BDT',
  //     isActive: true,
  //   });
  //   await walletRepo.save(holding);
  // }

  // console.log('✅ Seed complete:', {
  //   adminId: admin.id,
  //   platformWallet: platform.id,
  //   holdingWallet: holding.id,
  // });
}
