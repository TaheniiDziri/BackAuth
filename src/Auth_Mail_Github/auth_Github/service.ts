import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwt(user: any) {
    const payload = { id: user.id, username: user.username, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}