import { Injectable, NotFoundException } from "@nestjs/common"
import  { Repository } from "typeorm"
import  { Category } from "~/entity"
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto"
import { InjectRepository } from "@nestjs/typeorm"

// @Injectable()
// export class CategoriesService {


//   constructor( @InjectRepository(Category) 
//   private readonly categoryRepo: Repository<Category>
// ) { }

//   async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
//     const category = this.categoryRepo.create(createCategoryDto)
//     return this.categoryRepo.save(category)
//   }

//   async findAll(): Promise<Category[]> {
//     return this.categoryRepo.find({
//       where: { isActive: true },
//       relations: ["parent", "children"],
//       order: { sortOrder: "ASC", name: "ASC" },
//     })
//   }

//   async findTree(): Promise<Category[]> {
//     return this.categoryRepo.find({
//       where: { parent: null as any, isActive: true },
//       relations: ["children"],
//       order: { sortOrder: "ASC", name: "ASC" },
//     })
//   }

//   async findOne(id: string): Promise<Category> {
//     const category = await this.categoryRepo.findOne({
//       where: { id },
//       relations: ["parent", "children", "products"],
//     })

//     if (!category) {
//       throw new NotFoundException("Category not found")
//     }

//     return category
//   }

//   async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
//     const category = await this.findOne(id)
//     Object.assign(category, updateCategoryDto)
//     return this.categoryRepo.save(category)
//   }

//   async remove(id: string): Promise<void> {
//     const category = await this.findOne(id)
//     category.isActive = false
//     await this.categoryRepo.save(category)
//   }
// }


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // Create category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create(data)
    return this.categoryRepo.save(category)
  }

  // Get all categories (flat list)
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find({ relations: ["parent"] })
  }

  // Get single category with recursive children + products
  async getCategoryTreeWithProducts(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ["parent", "products"],
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Recursive load children
    const loadChildren = async (cat: Category): Promise<Category> => {
      const children = await this.categoryRepo.find({
        where: { parent: { id: cat.id } },
        relations: ["products"],
      })

      cat.children = await Promise.all(children.map(loadChildren))
      return cat
    }

    return loadChildren(category)
  }

  // Update category
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    await this.categoryRepo.update(id, data)
    return this.getCategoryTreeWithProducts(id)
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await this.categoryRepo.delete(id)
  }
}