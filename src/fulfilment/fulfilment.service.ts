import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';

@Injectable()
export class FulfilmentService {
  constructor(@InjectRepository(Shipment) private readonly shipments: Repository<Shipment>) {}

  async enqueue(orderId: string, courier?: string) {
    const shipment = this.shipments.create({ order: { id: orderId } as any, courier });
    return this.shipments.save(shipment);
  }

  async updateStatus(shipmentId: string, status: ShipmentStatus) {
    await this.shipments.update(shipmentId, { status });
    return this.shipments.findOne({ where: { id: shipmentId } });
  }
}
