// src/product-services/payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '~/orders/entities/order.entity';
import { Payment, PaymentStatus } from '~/payments/entities/payment.entity';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async createPayment(
    userId: string,
    orderId: string,
    amount: number,
    method: string,
  ) {
    // Ensure user and order exist
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['buyer'],
    });
    if (!order) throw new Error('Order not found or does not belong to user');

    const user = await this.orderRepo.manager.findOne('User', {
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const p = this.paymentRepo.create({
      user: { id: userId } as any,
      amount,
      method,
      status: PaymentStatus.PENDING,
      order: { id: orderId } as any,
    });
    return this.paymentRepo.save(p);
  }

  async capturePayment(paymentId: string) {
    const p = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });
    if (!p) throw new Error('Payment not found');
    if (p.status === PaymentStatus.CAPTURED) return p;
    // Integrate gateway here; on success:
    p.status = PaymentStatus.CAPTURED;
    await this.paymentRepo.save(p);

    // mark order as completed (or keep logic in purchase service)
    if (p.order) {
      p.order.status = OrderStatus.COMPLETED;
      await this.orderRepo.save(p.order);
    }
    return p;
  }
}
