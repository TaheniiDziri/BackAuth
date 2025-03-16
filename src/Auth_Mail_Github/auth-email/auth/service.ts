import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser(
      username,
      email,
      hashedPassword,
    );

    return { message: 'User registered successfully', user };
  }

  async login(email: string, password: string) {
    
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    const token = this.jwtService.sign({
      userId: user._id,
      username: user.username,
    });

    return { message: 'Login successful', token };
  }
}