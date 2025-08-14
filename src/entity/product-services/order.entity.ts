import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { User } from "../users"
import { OrderItem } from "./order-item.entity"

export enum OrderStatus {
  PENDING_PAYMENT = "pending_payment",
  PAID = "paid",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  COD = "cod",
  CARD = "card",
  MOBILE_BANKING = "mobile_banking",
  BKASH = "bkash",
  NAGAD = "nagad",
  ROCKET = "rocket",
  WALLET = "wallet",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  orderNumber: string

  @ManyToOne(
    () => User,
    (user) => user.orders,
  )
  @JoinColumn({ name: "userId" })
  user: User

  @OneToMany(
    () => OrderItem,
    (item) => item.order,
    { cascade: true },
  )
  items: OrderItem[]

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  subtotalAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  shippingAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalAmount: number

  @Column({ type: "enum", enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod

  @Column({ type: "jsonb", nullable: true })
  shippingAddress: any

  @Column({ type: "jsonb", nullable: true })
  billingAddress: any

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ nullable: true })
  trackingNumber: string

  @Column({ nullable: true })
  couponCode: string

  @Column({ type: "jsonb", nullable: true })
  metadata: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
