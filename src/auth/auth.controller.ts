import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Req, Res } from "@nestjs/common"
import { Response } from 'express'
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import type { RegisterDto } from "./dto/register.dto"
import { LocalAuthGuard } from "../common/guards/local-auth.guard"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger"
import { JwtRefreshGuard } from "../common/guards/jwt-refresh.guard"

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 1,
          email: 'user@example.com',
          phone: '+1234567890',
          role: 'USER'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
    /**TODO:
     * We need to generate totken if client want
     */
  }


  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          phone: "+8801631551301",
          role: 'USER',
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto);
    const tokens = await this.authService.issueTokens(user);

    // Set refresh token in HttpOnly cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod
      sameSite: 'strict',
      maxAge: this.authService.parseExpires(process.env.JWT_REFRESH_EXPIRES || '1d')  // 7 days
    });

    // Send only access token in response body
    return {
      user, refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
    };
  }


  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 3600
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { sub, email, role } = req.user;
    const tokens = await this.authService.issueTokens({ id: sub, email, role });

    // rotate refresh token in cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
    };
  }

}
