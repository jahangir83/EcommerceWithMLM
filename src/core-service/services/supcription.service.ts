import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subscription } from "~/entity";
import { UserStatus } from "~/common/enums/common.enum";
import { CreateSubscriptionDto, UpdateSubscriptionDto } from "../dto/create-service.dto";


@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepo: Repository<Subscription>,
    ) { }

    async create(dto: CreateSubscriptionDto): Promise<Subscription> {
        const existing = await this.subscriptionRepo.findOne({
            where: { serviceStatus: UserStatus.ADVANCED_ACCESS_USER },
        });
        if (existing) {
            throw new ConflictException("Subscription already exists");
        }
        const entity = this.subscriptionRepo.create(dto);
        return this.subscriptionRepo.save(entity);
    }

    async findAll(): Promise<Subscription[]> {
        return this.subscriptionRepo.find();
    }


    async findAllBuyers(): Promise<Subscription[]> {
        return await this.subscriptionRepo.find({
            where: { isActive: true }, relations: ["users"], select: {

                id: true, serviceName: true,
                price: true,
                description: true,
                image: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                serviceStatus: true,
                type: true,
                generationPrice: true,
                isGenerationPriceActive: true,

                users: {
                    id: true,
                    username: true,
                    phone: true,
                }
            }
        });
    }

    async findOne(id: string): Promise<Subscription> {
        const entity = await this.subscriptionRepo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException("Subscription not found");
        return entity;
    }

    async update(id: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
        const entity = await this.findOne(id);
        Object.assign(entity, dto);
        return this.subscriptionRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        const entity = await this.findOne(id);
        await this.subscriptionRepo.remove(entity);
    }
}
