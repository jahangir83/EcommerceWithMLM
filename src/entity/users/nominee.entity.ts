import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";




@Entity('nominee')
export class Nominee {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name:string

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: false })
    nidNumber: string;

    @Column({ nullable: false })
    relation: string


    @OneToOne(() => User, (user) => user.nominee)
    @JoinColumn({name: 'userId'})
    user: User
}