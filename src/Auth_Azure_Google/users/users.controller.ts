import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(@Body() body: { email: string; username: string; password: string }): Promise<User> {
    return this.usersService.createUser(body.email, body.username, body.password);
  }

}