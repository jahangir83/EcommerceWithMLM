import { DataSource } from 'typeorm';
import { AccountBalance, Category, Course, JournalEntry, LeaderShipDisignation, Subscription, Transaction, Uddokta, User, UserProfile, Wallet, Withdrawal, Product, } from '../entity/index';
import { Verify } from '../entity/users/verify.entity';
import { Shipment } from '../fulfilment/entities/shipment.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { RevenueShare } from '../revenue/entities/revenue-share.entity';
import { Nominee } from '../entity/users/nominee.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://nest:nestjs@localhost:5432/nest',
  entities: [
    User,
    Nominee,
    UserProfile,
    Wallet,
    AccountBalance,
    Course,
    Subscription,
    Uddokta,
    Product,
    Category,
    Order,
    OrderItem,
    Payment,
    Transaction,
    Withdrawal,
    RevenueShare,
    JournalEntry,
    LeaderShipDisignation,

    Shipment, // Added Shipment entity for fulfillment tracking
    Verify
  ],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  // migrations: ["src/database/migrations/*.ts"],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',

});
