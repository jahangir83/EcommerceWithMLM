// src/product-services/payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '~/entity/product-services/payment.entity';
import { Order } from '~/entity/product-services/purchase.entity';

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
      where: { id: orderId, buyer: { id: userId } },
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
      status: 'pending',
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
    if (p.status === 'captured') return p;
    // Integrate gateway here; on success:
    p.status = 'captured';
    await this.paymentRepo.save(p);

    // mark order as completed (or keep logic in purchase service)
    if (p.order) {
      p.order.status = 'completed';
      await this.orderRepo.save(p.order);
    }
    return p;
  }
}
