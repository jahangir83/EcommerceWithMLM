import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Entity,
} from 'typeorm';
import { generationPriceInterface, ServiceInterface } from '~/common/types/services.type';
import { User } from '../users/user.entity';
import { UserStatus } from '~/common/enums/common.enum';

@Entity()
export class Uddokta implements ServiceInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column()
  serviceName: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ADVANCED_UDDOKTA,
  })
  serviceStatus: UserStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;


  @Column({ type: 'json', nullable: true })
  generationPrice: generationPriceInterface[];

  @Column({ type: 'boolean', default: false })
  isGenerationPriceActive: boolean


  @OneToMany(() => User, (user) => user.uddokta, { cascade: true })
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
