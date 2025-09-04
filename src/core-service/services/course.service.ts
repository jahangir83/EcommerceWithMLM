// src/modules/courses/course.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Course } from "~/entity";
import { CreateServiceDto, UpdateCourseDto } from "../dto/create-service.dto";

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepo: Repository<Course>,
    ) { }

    async create(dto: CreateServiceDto): Promise<Course> {
        const course = this.courseRepo.create(dto);
        return await this.courseRepo.save(course);
    }

    async findAll(): Promise<Course[]> {
        return await this.courseRepo.find({
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

    async findAllBuyers(): Promise<Course[]> {
        return await this.courseRepo.find({
            where: { isActive: true }, relations: ["users"], select: {
                users: {
                    id: true,
                    username: true,
                    phone: true,
                }
            }
        });
    }

    async findOne(id: string): Promise<Course> {
        const course = await this.courseRepo.findOne({
            where: { id }, select: {
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
        if (!course) throw new NotFoundException("Course not found");
        return course;
    }

    async update(id: string, dto: UpdateCourseDto): Promise<Course> {
        const course = await this.findOne(id);
        Object.assign(course, dto);
        return await this.courseRepo.save(course);
    }

    async remove(id: string): Promise<void> {
        const course = await this.findOne(id);
        await this.courseRepo.remove(course);
    }

    async toggleActive(id: string): Promise<Course> {
        const course = await this.findOne(id);
        course.isActive = !course.isActive;
        return await this.courseRepo.save(course);
    }
}
