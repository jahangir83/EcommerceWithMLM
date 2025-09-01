// src/entity/course.entity.ts
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
} from 'typeorm';
import { User } from '../users/user.entity';
import { UserStatus } from '~/common/enums/common.enum';
import { generationPriceInterface, ServiceInterface } from '~/common/types/services.type';

@Entity()
export class Course implements ServiceInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  price: string;

  @Column()
  serviceName: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ADVANCED_ASSOCIATE,
  })
  serviceStatus: UserStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  generationPrice?: generationPriceInterface[];

  @Column({ type: 'boolean', default: false })
  isGenerationPriceActive: boolean;

  @OneToMany(() => User, (user) => user.course, { cascade: true })
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
