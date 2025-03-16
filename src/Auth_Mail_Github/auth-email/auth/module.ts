import { Module } from '@nestjs/common';
import { AuthService } from './service';
import { AuthController } from './controller';
import { UserModuleEmail } from '../user/module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModuleEmail,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModuleEmail {}