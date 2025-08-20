import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { User } from "../users/user.entity";

export enum VerifyType {
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    OTP = "OTP", // One-time password
    REFERRAL = "REFERRAL",
    PASSWORD_RESET = "PASSWORD_RESET",
}

@Entity("verify")
export class Verify {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: VerifyType,
    })
    type: VerifyType;

    // Value to verify (email, phone, etc.)
    @Index()
    @Column()
    value: string;

    // Code/token sent to the user (OTP, hash, link token, etc.)
    @Column()
    code: string;

    // Expiration time for the code
    @Column({ type: "timestamptz", nullable: true })
    expiresAt: Date | null;

    // Whether it has been used
    @Column({ default: false })
    isUsed: boolean;

    // 🔹 Relation with User
    @ManyToOne(() => User, (user) => user.verifications, {
        onDelete: "CASCADE", // delete verifications if user is deleted
    })
    verifications: Verify[];
    @JoinColumn({ name: "userId" })
    user?: User;

    @Column({ nullable: true })
    userId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
