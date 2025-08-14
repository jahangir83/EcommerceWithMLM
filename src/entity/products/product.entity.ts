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
import { Category } from "./category.entity"
import { User } from "../users"
import { OrderItem } from "../product-services"

export enum ProductType {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  SERVICE = "service",
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "text", nullable: true })
  shortDescription: string

  @ManyToOne(
    () => Category,
    (category) => category.products,
  )
  @JoinColumn({ name: "categoryId" })
  category: Category

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  salePrice: number

  @Column({ default: 0 })
  stock: number

  @Column({ type: "enum", enum: ProductType, default: ProductType.PHYSICAL })
  type: ProductType

  @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus

  @Column({ nullable: true })
  sku: string

  @Column("simple-array", { nullable: true })
  images: string[]

  @Column({ type: "jsonb", nullable: true })
  specifications: any

  @Column({ type: "jsonb", nullable: true })
  seoData: any

  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  weight: number

  @Column({ type: "jsonb", nullable: true })
  dimensions: any

  @Column({ default: false })
  isFeatured: boolean

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  salesCount: number

  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  reviewCount: number

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "vendorId" })
  vendor: User

  @OneToMany(
    () => OrderItem,
    (item) => item.product,
  )
  orderItems: OrderItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
