import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { User } from "~/entity"

export enum NotificationType {
  ORDER = "order",
  PAYMENT = "payment",
  COMMISSION = "commission",
  WITHDRAWAL = "withdrawal",
  LEVEL_UP = "level_up",
  SYSTEM = "system",
  MARKETING = "marketing",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType

  @Column()
  title: string

  @Column({ type: "text" })
  message: string

  @Column({ type: "jsonb", nullable: true })
  data: any

  @Column({ default: false })
  isRead: boolean

  @Column({ nullable: true })
  readAt: Date

  @CreateDateColumn()
  createdAt: Date
}
