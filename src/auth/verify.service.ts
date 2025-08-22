import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { randomInt } from "crypto";
import { Verify, VerifyType } from "~/entity/users/verify.entity";
import { User } from "~/entity";

@Injectable()
export class VerifyService {
    constructor(
        @InjectRepository(Verify)
        private verifyRepo: Repository<Verify>,

    ) { }

    async requestVerify(
        type: VerifyType,
        value: string,
        user?: User,
        expiresInMinutes = 10
    ): Promise<Verify> {
        const code = String(randomInt(1000, 9999));
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        const verify = this.verifyRepo.create({
            type,
            value,
            code,
            user,
            userId: user?.id,
            expiresAt,
        });
        await this.verifyRepo.save(verify);

        // ⚡ Integrate with SMS/Email/Payment provider here
        return verify
    }

    async confirmVerify(type: VerifyType, value: string, code: string) {
        const verify = await this.verifyRepo.findOne({
            where: { type, value, code, isUsed: false },
        });

        if (!verify) throw new NotFoundException("Invalid verification request");
        if (verify.expiresAt && verify.expiresAt < new Date())
            throw new BadRequestException("Verification code expired");

        verify.isUsed = true;
        await this.verifyRepo.save(verify);

        return {
            message: `${type} verification successful`,
            type,
            value,
        };
    }

    async isVerified(type: VerifyType, value: string): Promise<boolean> {

        const verify = await this.verifyRepo.findOne({
            where: {
                type: type,
                value: value
            }
        })

        if (verify && verify?.isUsed) {
            return true
        }

        return false

    }
}
