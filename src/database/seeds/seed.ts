// import { AppDataSource } from "../data-source"
// import { User, UserRole } from "../../entities/user.entity"
// import { Vendor, VendorStatus } from "../../entities/vendor.entity"
// import { Category } from "../../entities/category.entity"
// import { Product } from "../../entities/product.entity"
// import { Group } from "../../entities/group.entity"
// import * as bcrypt from "bcryptjs"

// async function seed() {
//   await AppDataSource.initialize()

//   const userRepository = AppDataSource.getRepository(User)
//   const vendorRepository = AppDataSource.getRepository(Vendor)
//   const categoryRepository = AppDataSource.getRepository(Category)
//   const productRepository = AppDataSource.getRepository(Product)
//   const groupRepository = AppDataSource.getRepository(Group)

//   // Create admin user
//   const adminPassword = await bcrypt.hash("admin123", 10)
//   const admin = await userRepository.save({
//     email: "admin@example.com",
//     password: adminPassword,
//     firstName: "Admin",
//     lastName: "User",
//     role: UserRole.ADMIN,
//     isEmailVerified: true,
//   })

//   // Create vendor user
//   const vendorPassword = await bcrypt.hash("vendor123", 10)
//   const vendorUser = await userRepository.save({
//     email: "vendor@example.com",
//     password: vendorPassword,
//     firstName: "John",
//     lastName: "Vendor",
//     role: UserRole.VENDOR,
//     isEmailVerified: true,
//   })

//   // Create vendor profile
//   const vendor = await vendorRepository.save({
//     userId: vendorUser.id,
//     businessName: "Tech Store",
//     description: "Electronics and gadgets",
//     address: "123 Business St, City, State",
//     phone: "+1234567890",
//     status: VendorStatus.APPROVED,
//   })

//   // Create customer user
//   const customerPassword = await bcrypt.hash("customer123", 10)
//   const customer = await userRepository.save({
//     email: "customer@example.com",
//     password: customerPassword,
//     firstName: "Jane",
//     lastName: "Customer",
//     role: UserRole.CUSTOMER,
//     isEmailVerified: true,
//   })

//   // Create categories
//   const electronicsCategory = await categoryRepository.save({
//     name: "Electronics",
//     description: "Electronic devices and accessories",
//   })

//   const phonesCategory = await categoryRepository.save({
//     name: "Smartphones",
//     description: "Mobile phones and accessories",
//     parentId: electronicsCategory.id,
//   })

//   // Create products
//   const product1 = await productRepository.save({
//     name: "iPhone 15 Pro",
//     description: "Latest iPhone with advanced features",
//     price: 999.99,
//     stock: 50,
//     images: ["iphone15pro.jpg"],
//     vendorId: vendor.id,
//     categoryId: phonesCategory.id,
//   })

//   const product2 = await productRepository.save({
//     name: "Samsung Galaxy S24",
//     description: "Premium Android smartphone",
//     price: 899.99,
//     stock: 30,
//     images: ["galaxys24.jpg"],
//     vendorId: vendor.id,
//     categoryId: phonesCategory.id,
//   })

//   // Create a group buying opportunity
//   await groupRepository.save({
//     name: "iPhone 15 Pro Group Buy",
//     description: "Get 10% discount when we reach 10 participants",
//     productId: product1.id,
//     minParticipants: 10,
//     maxParticipants: 50,
//     discountPercent: 10.0,
//     endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
//   })

//   console.log("Database seeded successfully!")
//   await AppDataSource.destroy()
// }

// seed().catch((error) => {
//   console.error("Seeding failed:", error)
//   process.exit(1)
// })
