import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Uddokta } from "~/entity";
import { UserStatus } from "~/common/enums/common.enum";
import { CreateCourseDto, UpdateCourseDto } from "../dto/create-service.dto";

@Injectable()
export class UddoktaService {
    constructor(
        @InjectRepository(Uddokta)
        private readonly uddoktaRepo: Repository<Uddokta>,
    ) { }

    async create(dto: CreateCourseDto): Promise<Uddokta> {
        const existing = await this.uddoktaRepo.findOne({
            where: { serviceStatus: UserStatus.ADVANCED_UDDOKTA },
        });
        if (existing) {
            throw new ConflictException("Uddokta already exists");
        }
        const entity = this.uddoktaRepo.create(dto);
        return this.uddoktaRepo.save(entity);
    }

    async findAll(): Promise<Uddokta[]> {
        return this.uddoktaRepo.find({
            select: {
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
            }
        });
    }


    async findAllBuyers(): Promise<Uddokta[]> {
        return await this.uddoktaRepo.find({
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

    async findOne(id: string): Promise<Uddokta> {
        const entity = await this.uddoktaRepo.findOne({ where: { id } , select:{
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
    }});
        if (!entity) throw new NotFoundException("Uddokta not found");
        return entity;
    }

    async update(id: string, dto: UpdateCourseDto): Promise<Uddokta> {
        const entity = await this.findOne(id);
        Object.assign(entity, dto);
        return this.uddoktaRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        const entity = await this.findOne(id);
        await this.uddoktaRepo.remove(entity);
    }
}
