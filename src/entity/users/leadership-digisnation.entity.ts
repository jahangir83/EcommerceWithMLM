import { Column, Entity, PrimaryColumn } from "typeorm";
import { TargetType, LeaderShipDisignationInterface } from "~/common/types/user.type";




@Entity('leader_ship_disignation')

export class LeaderShipDisignation implements LeaderShipDisignationInterface {

    @PrimaryColumn({ type: 'int',  })
    id: number;
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string;
    @Column({ type: 'jsonb', nullable: true })
    target: TargetType[];

    @Column({ type: 'text', nullable: true })
    targetContent: string;

    @Column({ type: 'varchar', length: 100 })
    award: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
