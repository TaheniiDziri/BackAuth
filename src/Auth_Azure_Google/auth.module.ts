import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { AzureStrategy } from './strategies/azure.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGoogle, UserGoogleSchema } from './users/entities/UserGoogle.entity';
import { UserAzure, UserAzureSchema } from './users/entities/UserAzure.entity'; // Corrected import
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey', // Ensure this is defined in your .env file
      signOptions: { expiresIn: '60m' },
    }),
    MongooseModule.forFeature([
      { name: UserGoogle.name, schema: UserGoogleSchema, collection: 'UsersGoogle' },
      { name: UserAzure.name, schema: UserAzureSchema, collection: 'UsersAzure' }, // Added schema for Azure users
    ]),
    UsersModule,
    HttpModule, // Required for HTTP requests (e.g., Azure token validation)
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    AzureStrategy, // Corrected provider name
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}