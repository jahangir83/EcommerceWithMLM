import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { AuthController } from './auth.controller';
import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';
import { Verify } from '~/entity/users/verify.entity';



@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRETJWT_ACCESS_SECRET ?? 'SECRETAIT',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
    PassportModule,
    TypeOrmModule.forFeature([User, Verify]),
    // UserModule,
  ],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, VerifyService],
  controllers: [AuthController, VerifyController],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule { }
