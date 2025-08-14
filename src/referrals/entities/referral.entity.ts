import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
@Unique(['code'])
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToOne(() => User, { nullable: true })
  parent: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
