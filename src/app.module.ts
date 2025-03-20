import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './Auth_Azure_Google/users/users.module';
import { AuthModule } from './Auth_Azure_Google/auth.module';
import { AuthModuleGithub } from './Auth_Mail_Github/auth_Github/module'; // Vérifie le chemin exact
import { AuthModuleEmail } from './Auth_Mail_Github/auth-email/auth/module';  // Corrige le nom du module
import { UserModuleEmail } from './Auth_Mail_Github/auth-email/user/module'; // Corrige la syntaxe de l'importation
import { CoopCoepMiddleware } from './coop-coep.middleware'; // Importer le middleware

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase'),
    UsersModule,
    AuthModule,
    AuthModuleGithub,
    AuthModuleEmail, 
    UserModuleEmail,  
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CoopCoepMiddleware) // Appliquer le middleware
      .forRoutes('*'); // Appliquer à toutes les routes
  }
}
