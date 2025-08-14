import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Category } from "~/entity"
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto"

@Injectable()
export class CategoriesService {
  private categoryRepo: Repository<Category>

  constructor(categoryRepo: Repository<Category>) {
    this.categoryRepo = categoryRepo
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create(createCategoryDto)
    return this.categoryRepo.save(category)
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      relations: ["parent", "children"],
      order: { sortOrder: "ASC", name: "ASC" },
    })
  }

  async findTree(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { parent: null as any, isActive: true },
      relations: ["children"],
      order: { sortOrder: "ASC", name: "ASC" },
    })
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ["parent", "children", "products"],
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    Object.assign(category, updateCategoryDto)
    return this.categoryRepo.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    category.isActive = false
    await this.categoryRepo.save(category)
  }
}
