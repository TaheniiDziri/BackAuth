/*import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGoogle, UserGoogleSchema } from './entities/UserGoogle.entity';  

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    // Utiliser UserGoogle et son schéma pour la collection 'UsersGoogle'
    MongooseModule.forFeature([{ name: UserGoogle.name, schema: UserGoogleSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporter le UsersService pour qu'il soit accessible ailleurs
})
export class UsersModule {}





*/





import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGoogle, UserGoogleSchema } from './entities/UserGoogle.entity';
import { UserAzure, UserAzureSchema } from './entities/UserAzure.entity'; // Ajouter UserAzure

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserGoogle.name, schema: UserGoogleSchema }]),
    MongooseModule.forFeature([{ name: UserAzure.name, schema: UserAzureSchema }]), // Ajouter UserAzure dans le module
  ],
  controllers: [UsersController],
  providers: [UsersService], // Utiliser le service global
  exports: [UsersService], // Exporter UsersService pour d'autres modules si nécessaire
})
export class UsersModule {}
