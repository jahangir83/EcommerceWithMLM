import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, Subscription, Uddokta } from "~/entity";
import { CourseController } from "./course.controller";
import { UddoktaController } from "./uddokta.controller";
import { SubscriptionController } from "./subcription.controller";


@Module({
    imports: [TypeOrmModule.forFeature([Course, Subscription, Uddokta])],
    controllers: [CourseController, UddoktaController, SubscriptionController],
    providers: [],
    exports: []
})


export class CoreServiceModule { }