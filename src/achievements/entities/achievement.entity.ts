import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column()
  key: string; // e.g., 'leadership.level1'

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  achieved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
