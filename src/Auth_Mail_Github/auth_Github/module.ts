import { Module } from '@nestjs/common';
import { AuthService } from './service';
import { GithubAuthController } from './controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GithubStrategy } from './strategies/github.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';  // Importez HttpModule

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    HttpModule,  // Ajoutez HttpModule ici
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [GithubAuthController],
  providers: [AuthService, GithubStrategy],
})
export class AuthModuleGithub {}
