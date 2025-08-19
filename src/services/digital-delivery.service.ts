import { Injectable } from "@nestjs/common"
import  { Repository } from "typeorm"
import  { User } from "~/entity/users/user.entity"
import  { Course } from "~/entity/product-services/course.entity"
import  { Subscription } from "~/entity/product-services/subscription.entity"
import  { Product } from "~/entity/products/product.entity"
import  { EmailService } from "./email.service"
import  { NotificationsService } from "~/notifications/notifications.service"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class DigitalDeliveryService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async deliverDigitalProduct(userId: string, productId: string, orderData: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    const product = await this.productRepo.findOne({ where: { id: productId } })

    if (!user || !product) {
      throw new Error("User or product not found")
    }

    const deliveryResult = {
      success: false,
      type: product.type,
      accessGranted: false,
      deliveryMethod: "digital",
      deliveredAt: new Date(),
    }

    try {
      // switch (product.type) {
      //   case   "course":
      //     await this.enrollUserInCourse(user, product, orderData)
      //     deliveryResult.accessGranted = true
      //     break

      //   case "subscription":
      //     await this.activateUserSubscription(user, product, orderData)
      //     deliveryResult.accessGranted = true
      //     break

      //   case "digital_download":
      //     await this.grantDownloadAccess(user, product, orderData)
      //     deliveryResult.accessGranted = true
      //     break

      //   case "software_license":
      //     await this.issueSoftwareLicense(user, product, orderData)
      //     deliveryResult.accessGranted = true
      //     break

      //   default:
      //     console.log(`[v0] Unknown digital product type: ${product.type}`)
      // }

      // Send delivery confirmation
      await this.sendDeliveryConfirmation(user, product, deliveryResult)
      deliveryResult.success = true

      return deliveryResult
    } catch (error) {
      console.error("[v0] Digital delivery failed:", error)
      deliveryResult.success = false
      return deliveryResult
    }
  }

  private async enrollUserInCourse(user: User, product: Product, orderData: any) {
    // Find the course associated with this product
    const course = await this.courseRepo.findOne({
      where: { serviceName: product.name },
    })

    // if (course) {
    //   // Update user's course enrollment
    //   user.course = course
    //   user.courseEnrollmentDate = new Date()
    //   user.courseStatus = "active"
    //   await this.userRepo.save(user)

    //   // Create course access record
    //   await this.createCourseAccess(user.id, course.id, orderData)

    //   console.log(`[v0] User ${user.id} enrolled in course ${course.id}`)
    // }
  }

  private async activateUserSubscription(user: User, product: Product, orderData: any) {
    // Find the subscription associated with this product
    const subscription = await this.subscriptionRepo.findOne({
      where: { serviceName: product.name },
    })

    // if (subscription) {
    //   // Update user's subscription
    //   user.subscription = subscription
    //   user.subscriptionStartDate = new Date()
    //   user.subscriptionStatus = "active"

    //   // Calculate next billing date based on subscription type
    //   const nextBillingDate = this.calculateNextBillingDate(subscription.type)
    //   user.subscriptionNextBilling = nextBillingDate

    //   await this.userRepo.save(user)

    //   console.log(`[v0] User ${user.id} activated subscription ${subscription.id}`)
    // }
  }

  private async grantDownloadAccess(user: User, product: Product, orderData: any) {
    // Create download access record
    const downloadAccess = {
      userId: user.id,
      productId: product.id,
      downloadUrl: "",//product.downloadUrl,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      downloadLimit: "",//product.downloadLimit || 5,
      downloadsUsed: 0,
      createdAt: new Date(),
    }

    // Store download access (you might want a separate entity for this)
    console.log(`[v0] Download access granted for user ${user.id}, product ${product.id}`)

    return downloadAccess
  }

  private async issueSoftwareLicense(user: User, product: Product, orderData: any) {
    // Generate license key
    const licenseKey = this.generateLicenseKey(user.id, product.id)

    // Create license record
    const license = {
      userId: user.id,
      productId: product.id,
      licenseKey,
      issuedAt: new Date(),
      expiresAt: null,//product.licenseExpiry ? new Date(Date.now() + product.licenseExpiry) : null,
      status: "active",
    }

    console.log(`[v0] Software license issued for user ${user.id}: ${licenseKey}`)

    return license
  }

  private async createCourseAccess(userId: string, courseId: string, orderData: any) {
    // Create course access record with progress tracking
    const courseAccess = {
      userId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      status: "enrolled",
      completedLessons: [],
      lastAccessedAt: new Date(),
    }

    // You might want to create a separate CourseAccess entity
    return courseAccess
  }

  private calculateNextBillingDate(subscriptionType: string): Date {
    const now = new Date()

    switch (subscriptionType.toLowerCase()) {
      case "monthly":
        return new Date(now.setMonth(now.getMonth() + 1))
      case "quarterly":
        return new Date(now.setMonth(now.getMonth() + 3))
      case "yearly":
        return new Date(now.setFullYear(now.getFullYear() + 1))
      default:
        return new Date(now.setMonth(now.getMonth() + 1))
    }
  }

  private generateLicenseKey(userId: string, productId: string): string {
    const timestamp = Date.now().toString(36)
    const userHash = userId.slice(-4)
    const productHash = productId.slice(-4)
    const random = Math.random().toString(36).slice(-4)

    return `${timestamp}-${userHash}-${productHash}-${random}`.toUpperCase()
  }

  private async sendDeliveryConfirmation(user: User, product: Product, deliveryResult: any) {
    // Send email confirmation
    //await this.emailService.sendDigitalDeliveryConfirmation(user.email, user.name, product.name, deliveryResult)

    // Create in-app notification
    // await this.notificationsService.create({
    //   userId: user.id,
    //   title: "Digital Product Delivered",
    //   message: `Your ${product.type} "${product.name}" has been delivered and is ready to use.`,
    //   type: "delivery_confirmation",
    //   metadata: { productId: product.id, deliveryResult },
    // })
  }

  async getDeliveryStatus(userId: string, productId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["course", "subscription"],
    })

    if (!user) {
      return { delivered: false, reason: "User not found" }
    }

    const product = await this.productRepo.findOne({ where: { id: productId } })

    if (!product) {
      return { delivered: false, reason: "Product not found" }
    }

    // Check delivery status based on product type
    // switch (product.type) {
    //   case "course":
    //     return {
    //       delivered: !!user.course,
    //       accessGranted: user.courseStatus === "active",
    //       enrolledAt: user.courseEnrollmentDate,
    //     }

    //   case "subscription":
    //     return {
    //       delivered: !!user.subscription,
    //       accessGranted: user.subscriptionStatus === "active",
    //       activatedAt: user.subscriptionStartDate,
    //       nextBilling: user.subscriptionNextBilling,
    //     }

    //   default:
    //     return { delivered: true, accessGranted: true }
    // }
  }
}
