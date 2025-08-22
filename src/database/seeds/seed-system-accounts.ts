// scripts/seed-system-accounts.ts
import bcrypt from "bcrypt"
import { User } from "~/entity"
import { Wallet } from "~/entity/users/wallet.entity"
import { UserRole } from "~/common/enums/role.enum"
import { UserStatus, WalletType } from "~/common/enums/common.enum"
import { UserInterface } from "~/common/types/user.type"
import { AppDataSource } from "../data-source"

export async function runSeed() {

  await AppDataSource.initialize()

  const userRepo = AppDataSource.getRepository(User)
  const walletRepo = AppDataSource.getRepository(Wallet)

  console.log("🌱 Starting system accounts seeding...")

  type Account = Omit<UserInterface, 'id' | 'password' | 'generation'>

  const systemAccounts: Account[] = [
    {
      username: "SuperAdmin",
      phone: "0000000001",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "SUPERADMIN001",
    },
    {
      username: "SystemAdmin",
      phone: "0000000002",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "SYSADMIN001",

    },
    {
      username: "Developer",
      phone: "+8801631551301",
      role: UserRole.DEVELOPER,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "DEVELOPER001",
    },
    {
      username: "SystemVendor",
      phone: "0000000004",
      role: UserRole.VENDOR,
      status: UserStatus.ADVANCED_UDDOKTA,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "VENDOR001",
    },
  ]

  const createdUsers: User[] = []

  for (const accountData of systemAccounts) {
    let user: User | null = await userRepo.findOneBy({ phone: accountData.phone! })
    if (!user) {
      user = userRepo.create({
        username: accountData.username!,
        phone: accountData.phone!,
        role: accountData.role!,
        status: accountData.status!,
        isActive: accountData.isActive!,
        isPhoneVerified: accountData.isPhoneVerified!,
        isEmailVerified: accountData.isEmailVerified!,
        referralCode: accountData.referralCode!,
        password: await bcrypt.hash("SystemPass@123", 10),
        generation: 0,
        totalDirectReferrals: 0,
        leadershipId: 1,
        designation: "System Account",
      })
      await userRepo.save(user)
      createdUsers.push(user)
      console.log(`✅ Created ${accountData.role} account: ${accountData.phone}`)
    } else {
      console.log(`⚠️  ${accountData.role} account already exists: ${accountData.phone}`)
    }
  }

  for (const user of createdUsers) {
    // Create user wallets (MONEY, POINTS, COMMISSION)
    const walletTypes: WalletType[] = Object.values(WalletType)

    for (const walletType of walletTypes) {
      const existingWallet = await walletRepo.findOne({
        where: { user: { id: user.id }, walletType: walletType },
      })

      if (!existingWallet) {
        const wallet = walletRepo.create({
          user,
          balance: walletType === "MONEY" ? 10000 : 1000, // Initial balance
          walletType: walletType,
          currency: "BDT",
          isActive: true,
        })
        await walletRepo.save(wallet)
        console.log(`💰 Created ${walletType} wallet for ${user.username}`)
      }
    }
  }

  // Create dedicated system users for platform financial management
  const platformSystemAccounts = [
    {
      username: "PlatformRevenue",
      email: "revenue@system.com",
      phone: "0000000005",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "REVENUE001",
      initialBalances: { MONEY: 0, POINTS: 0, COMMISSION: 0 },
    },
    {
      username: "WithdrawalHolding",
      email: "withdrawal@system.com",
      phone: "0000000006",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "WITHDRAW001",
      initialBalances: { MONEY: 0, POINTS: 0, COMMISSION: 0 },
    },
    {
      username: "CommissionPool",
      email: "commissions@system.com",
      phone: "0000000007",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "COMMPOOL001",
      initialBalances: { MONEY: 50000, POINTS: 10000, COMMISSION: 50000 },
    },
    {
      username: "BonusPool",
      email: "bonus@system.com",
      phone: "0000000008",
      role: UserRole.ADMIN,
      status: UserStatus.ADVANCED_ACCESS_USER,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      referralCode: "BONUSPOOL001",
      initialBalances: { MONEY: 25000, POINTS: 5000, COMMISSION: 25000 },
    },
  ]

  // Create platform system users
  for (const accountData of platformSystemAccounts) {
    let user = await userRepo.findOneBy({ phone: accountData.phone })
    if (!user) {
      user = userRepo.create({
        username: accountData.username,
        phone: accountData.phone,
        role: accountData.role,
        status: accountData.status,
        isActive: accountData.isActive,
        isPhoneVerified: accountData.isPhoneVerified,
        isEmailVerified: accountData.isEmailVerified,
        referralCode: accountData.referralCode,
        password: await bcrypt.hash("SystemPass@123", 10),
        generation: 0,
        totalDirectReferrals: 0,
        leadershipId: 1,
        designation: "Platform System Account",
      })
      await userRepo.save(user)
      console.log(`✅ Created platform account: ${accountData.email}`)

      // Create wallets for platform users with specific balances
      const walletTypes = Object.values(WalletType)
      for (const walletType of walletTypes) {
        const wallet = walletRepo.create({
          user,
          balance: accountData.initialBalances[walletType],
          walletType,
          currency: "BDT",
          isActive: true,
        })
        await walletRepo.save(wallet)
        console.log(
          `💰 Created ${walletType} wallet for ${user.username} with balance: ${accountData.initialBalances[walletType]}`,
        )
      }
    } else {
      console.log(`⚠️  Platform account already exists: ${accountData.email}`)
    }
  }

  console.log("✅ System accounts seeding completed successfully!")
  console.log("📋 Default credentials for all system accounts:")
  console.log("   Password: SystemPass@123")
  console.log("   All accounts are verified and active")
  console.log("🏦 Platform financial management through dedicated system users:")
  console.log("   - PlatformRevenue: Collects platform fees and revenue")
  console.log("   - WithdrawalHolding: Manages withdrawal processing")
  console.log("   - CommissionPool: Funds for MLM commissions (50K money, 50K commission)")
  console.log("   - BonusPool: Special bonuses and rewards (25K money, 25K commission)")
}

// runSeed()