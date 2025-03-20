import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './controller';
import { AuthService } from './service';
import { UserProfil, UserSchemaProfil } from './user/schemagit';
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: UserProfil.name, schema: UserSchemaProfil },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModuleGithub {}