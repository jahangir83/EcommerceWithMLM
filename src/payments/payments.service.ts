import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import  { Repository } from "typeorm"

import type { CreatePaymentDto, PaymentFilterDto } from "./dto/payment.dto"
import  { OrdersService } from "~/orders/orders.service"
import { Payment, PaymentStatus } from "./entities/payment.entity"
import { Order, OrderStatus } from "~/orders/entities/order.entity"
import { InjectRepository } from "@nestjs/typeorm"



@Injectable()
export class PaymentsService {
  constructor(
      @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
      @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private ordersService: OrdersService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepo.findOne({
      where: { id: createPaymentDto.orderId },
      relations: ["user"],
    })

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Order is not pending payment")
    }

    const payment = this.paymentRepo.create({
      order,
      user: order.user,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || "BDT",
      method: createPaymentDto.method,
      status: PaymentStatus.PENDING,
      gatewayReference: createPaymentDto.gatewayReference,
      metadata: createPaymentDto.metadata,
    })

    return this.paymentRepo.save(payment)
  }

  async findAll(userId?: string, filterDto: PaymentFilterDto = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = filterDto

    const queryBuilder = this.paymentRepo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.order", "order")
      .leftJoinAndSelect("payment.user", "user")

    if (userId) {
      queryBuilder.andWhere("payment.userId = :userId", { userId })
    }

    if (status) {
      queryBuilder.andWhere("payment.status = :status", { status })
    }

    if (method) {
      queryBuilder.andWhere("payment.method = :method", { method })
    }

    if (startDate) {
      queryBuilder.andWhere("payment.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere("payment.createdAt <= :endDate", { endDate })
    }

    queryBuilder
      .orderBy(`payment.${sortBy}`, sortOrder as "ASC" | "DESC")
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

  async findOne(id: string, userId?: string): Promise<Payment> {
    const queryBuilder = this.paymentRepo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.order", "order")
      .leftJoinAndSelect("payment.user", "user")
      .where("payment.id = :id", { id })

    if (userId) {
      queryBuilder.andWhere("payment.userId = :userId", { userId })
    }

    const payment = await queryBuilder.getOne()

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    return payment
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    gatewayReference?: string,
    gatewayResponse?: any,
  ): Promise<Payment> {
    const payment = await this.findOne(id)

    payment.status = status
    if (gatewayReference) {
      payment.gatewayReference = gatewayReference
    }
    if (gatewayResponse) {
      payment.gatewayResponse = gatewayResponse
    }

    const updatedPayment = await this.paymentRepo.save(payment)

    // Update order status based on payment status
    if (status === PaymentStatus.SUCCESS) {
      await this.ordersService.updateStatus(payment.order.id, OrderStatus.PAID)
    } else if (status === PaymentStatus.FAILED || status === PaymentStatus.CANCELLED) {
      await this.ordersService.updateStatus(payment.order.id, OrderStatus.CANCELLED)
    }

    return updatedPayment
  }

  async processPayment(id: string): Promise<Payment> {
    const payment = await this.findOne(id)

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException("Payment is not pending")
    }

    // Update status to processing
    payment.status = PaymentStatus.PROCESSING
    await this.paymentRepo.save(payment)

    try {
      // Here you would integrate with actual payment gateways
      // For now, we'll simulate payment processing
      const success = await this.simulatePaymentGateway(payment)

      if (success) {
        return this.updateStatus(id, PaymentStatus.SUCCESS, `ref_${Date.now()}`, { processed_at: new Date() })
      } else {
        return this.updateStatus(id, PaymentStatus.FAILED, undefined, {
          error: "Payment failed",
          processed_at: new Date(),
        })
      }
    } catch (error) {
      return this.updateStatus(id, PaymentStatus.FAILED, undefined, { error: error.message, processed_at: new Date() })
    }
  }

  async refund(id: string, amount?: number): Promise<Payment> {
    const payment = await this.findOne(id)

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException("Payment is not successful")
    }

    const refundAmount = amount || payment.amount

    if (refundAmount > payment.amount) {
      throw new BadRequestException("Refund amount cannot exceed payment amount")
    }

    // Create refund record (you might want a separate Refund entity)
    payment.status = PaymentStatus.REFUNDED
    payment.gatewayResponse = {
      ...payment.gatewayResponse,
      refund: {
        amount: refundAmount,
        refunded_at: new Date(),
      },
    }

    return this.paymentRepo.save(payment)
  }

  private async simulatePaymentGateway(payment: Payment): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate 90% success rate
    return Math.random() > 0.1
  }

  async getPaymentStats(userId?: string) {
    const queryBuilder = this.paymentRepo.createQueryBuilder("payment")

    if (userId) {
      queryBuilder.where("payment.userId = :userId", { userId })
    }

    const [totalPayments, successfulPayments, failedPayments, totalAmount, successfulAmount] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere("payment.status = :status", { status: PaymentStatus.SUCCESS }).getCount(),
      queryBuilder.clone().andWhere("payment.status = :status", { status: PaymentStatus.FAILED }).getCount(),
      queryBuilder
        .clone()
        .select("SUM(payment.amount)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
      queryBuilder
        .clone()
        .andWhere("payment.status = :status", { status: PaymentStatus.SUCCESS })
        .select("SUM(payment.amount)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
    ])

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalAmount,
      successfulAmount,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
    }
  }
}
export { PaymentStatus }

