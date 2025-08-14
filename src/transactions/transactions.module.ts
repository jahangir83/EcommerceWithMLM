import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TransactionsController } from "./transaction.controller"
import { TransactionService } from "./services/transaction.service"
import { AccountService } from "./services/account.service"
import { RevenueService } from "./services/revenue.service"
import { Transaction, JournalEntry, Wallet, AccountBalance, RevenueShare, User } from "~/entity"

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, JournalEntry, Wallet, AccountBalance, RevenueShare, User])],
  controllers: [TransactionsController],
  providers: [TransactionService, AccountService, RevenueService],
  exports: [TransactionService, AccountService, RevenueService],
})
export class TransactionsModule {}
