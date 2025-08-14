import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { ProductType } from '../../products/product-type.enum';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @Column()
  productId: string;

  @Column({ type: 'enum', enum: ProductType })
  productType: ProductType;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  unitPrice: number;

  @Column()
  lineTotal: number;
}
