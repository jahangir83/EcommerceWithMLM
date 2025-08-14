import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '~/entity/users/user.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRETAIT',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
    PassportModule,
    TypeOrmModule.forFeature([User]),
    // UserModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  // ✅ Export these to make JwtAuthGuard work in other modules
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
