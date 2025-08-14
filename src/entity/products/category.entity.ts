import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { Product } from "./product.entity"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ nullable: true })
  slug: string

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  icon: string

  @ManyToOne(
    () => Category,
    (category) => category.children,
    { nullable: true },
  )
  @JoinColumn({ name: "parentId" })
  parent: Category

  @OneToMany(
    () => Category,
    (category) => category.parent,
  )
  children: Category[]

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products: Product[]

  @Column({ default: 0 })
  sortOrder: number

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "jsonb", nullable: true })
  seoData: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
