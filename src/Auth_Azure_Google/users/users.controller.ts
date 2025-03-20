import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserGoogle } from './entities/UserGoogle.entity';
import { UserAzure } from './entities/UserAzure.entity'; 


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-google')
  async createGoogleUser(@Body() body: { email: string; username: string; password: string }): Promise<UserGoogle> {
    return this.usersService.createUserGoogle(body.email, body.username, body.password);
  }

  @Post('create-azure')
  async createAzureUser(@Body() body: { email: string; azureId: string; username: string }): Promise<UserAzure> {
    return this.usersService.createUserAzure(body.email, body.azureId, body.username);
  }

  
}
