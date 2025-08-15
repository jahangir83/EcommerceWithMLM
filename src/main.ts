import 'reflect-metadata';
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { BadRequestException, ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as dotenv from "dotenv"
import cookieParser from 'cookie-parser';

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //Cookie parser


  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })

  // Use Global Pipes for Validation
  const validationPipe = new ValidationPipe({
    disableErrorMessages: false,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (error) => {
      const messages = error.map((err) => {
      
        const constraints = Object.values(err.constraints || {}).join(",")
        return { [err.property]: constraints }
      })
      return new BadRequestException(messages)
    },
  })
  app.useGlobalPipes(validationPipe)

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("AIT Platform API")
    .setDescription("Multi-vendor E-commerce Platform with MLM System API Documentation")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addTag("Authentication", "User authentication and registration")
    .addTag("Users", "User management and profiles")
    .addTag("Products", "Product management")
    .addTag("Orders", "Order management")
    .addTag("Payments", "Payment processing")
    .addTag("MLM", "Multi-level marketing operations")
    .addTag("Vendors", "Vendor management")
    .addTag("Admin", "Administrative operations")
    .addTag("Transactions", "Financial transactions")
    .addTag("Reports", "Analytics and reporting")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })

  const port = process.env.PORT || 3001
  app.use(cookieParser())
  await app.listen(port)

  console.log(`🚀 Backend server running on: http://localhost:${port}`)
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`)
}
bootstrap()
