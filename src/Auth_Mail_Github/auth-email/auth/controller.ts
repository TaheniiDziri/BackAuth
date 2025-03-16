// src/Auth_Mail_Github/auth-email/auth/controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './service';
import { RegisterDto, LoginDto } from './dto/dto';  // Assurez-vous d'importer LoginDto ici

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
