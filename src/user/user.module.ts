import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserProfile } from 'src/entity/users';
import { Nominee } from '~/entity/users/nominee.entity';
import { NomineeService } from './nominee.service';
import { NomineeController } from './nominee.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Nominee])],
  providers: [UserService, NomineeService],
  exports: [UserService, NomineeService], // Optional if other modules need to use this
  controllers: [UserController, NomineeController],
})
export class UserModule { }
