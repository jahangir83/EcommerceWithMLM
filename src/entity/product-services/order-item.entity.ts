import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Order } from "./order.entity"
import { Product } from "../products"

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Order,
    (order) => order.items,
  )
  @JoinColumn({ name: "orderId" })
  order: Order

  @ManyToOne(
    () => Product,
    (product) => product.orderItems,
  )
  @JoinColumn({ name: "productId" })
  product: Product

  @Column()
  productName: string

  @Column()
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number

  @Column({ type: "jsonb", nullable: true })
  productSnapshot: any
}
