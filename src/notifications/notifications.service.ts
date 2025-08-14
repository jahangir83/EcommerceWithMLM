import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Notification, NotificationType } from "./entities/notification.entity"
import type { User } from "~/entity"

@Injectable()
export class NotificationsService {
  private notificationRepo: Repository<Notification>
  private userRepo: Repository<User>

  constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>) {
    this.notificationRepo = notificationRepo
    this.userRepo = userRepo
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found")
    }

    const notification = this.notificationRepo.create({
      user,
      type,
      title,
      message,
      data,
    })

    return this.notificationRepo.save(notification)
  }

  async findAll(userId: string, filterDto: any = {}) {
    const { page = 1, limit = 20, type, isRead, sortBy = "createdAt", sortOrder = "DESC" } = filterDto

    const queryBuilder = this.notificationRepo
      .createQueryBuilder("notification")
      .where("notification.userId = :userId", { userId })

    if (type) {
      queryBuilder.andWhere("notification.type = :type", { type })
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere("notification.isRead = :isRead", { isRead })
    }

    queryBuilder
      .orderBy(`notification.${sortBy}`, sortOrder as "ASC" | "DESC")
      .skip((page - 1) * limit)
      .take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    })

    if (!notification) {
      throw new NotFoundException("Notification not found")
    }

    notification.isRead = true
    notification.readAt = new Date()

    return this.notificationRepo.save(notification)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ user: { id: userId }, isRead: false }, { isRead: true, readAt: new Date() })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { user: { id: userId }, isRead: false },
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    })

    if (!notification) {
      throw new NotFoundException("Notification not found")
    }

    await this.notificationRepo.remove(notification)
  }

  // Helper methods for creating specific notification types
  async notifyOrderCreated(userId: string, orderNumber: string, amount: number) {
    return this.create(
      userId,
      NotificationType.ORDER,
      "Order Created",
      `Your order ${orderNumber} has been created successfully. Total: $${amount}`,
      { orderNumber, amount },
    )
  }

  async notifyPaymentSuccess(userId: string, orderNumber: string, amount: number) {
    return this.create(
      userId,
      NotificationType.PAYMENT,
      "Payment Successful",
      `Payment of $${amount} for order ${orderNumber} has been processed successfully.`,
      { orderNumber, amount },
    )
  }

  async notifyCommissionEarned(userId: string, amount: number, level: number) {
    return this.create(
      userId,
      NotificationType.COMMISSION,
      "Commission Earned",
      `You earned $${amount} commission from level ${level} referral.`,
      { amount, level },
    )
  }

  async notifyWithdrawalProcessed(userId: string, amount: number, method: string) {
    return this.create(
      userId,
      NotificationType.WITHDRAWAL,
      "Withdrawal Processed",
      `Your withdrawal of $${amount} via ${method} has been processed.`,
      { amount, method },
    )
  }

  async notifyLevelUpgrade(userId: string, newLevel: string) {
    return this.create(
      userId,
      NotificationType.LEVEL_UP,
      "Level Upgrade",
      `Congratulations! You have been promoted to ${newLevel}.`,
      { newLevel },
    )
  }
}
