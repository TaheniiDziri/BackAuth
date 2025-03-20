/*import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserGoogle } from './entities/UserGoogle.entity';  // Importer UserGoogle


@Injectable()
export class UsersService {
  constructor(@InjectModel(UserGoogle.name) private userModel: Model<UserGoogle>) {}

  // Créer un utilisateur avec un email, un nom d'utilisateur et un mot de passe
  async createUser(email: string, username: string, password: string): Promise<UserGoogle> {
    const newUser = new this.userModel({ email, username, password });
    return newUser.save();
  }

  // Ajouter la méthode findById pour trouver un utilisateur par son ID
  async findById(id: string): Promise<UserGoogle | null> {
    return this.userModel.findById(id).exec(); // Utilisation de `findById` pour rechercher un utilisateur par son ID
  }
}
  */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserGoogle } from './entities/UserGoogle.entity';
import { UserAzure } from './entities/UserAzure.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserGoogle.name) private userGoogleModel: Model<UserGoogle>,
    @InjectModel(UserAzure.name) private userAzureModel: Model<UserAzure>,
  ) {}

  // Créer un utilisateur Google
  async createUserGoogle(email: string, username: string, password: string): Promise<UserGoogle> {
    const newUser = new this.userGoogleModel({ email, username, password });
    return newUser.save();
  }

  // Créer un utilisateur Azure
  async createUserAzure(email: string, azureId: string, username: string): Promise<UserAzure> {
    const newUser = new this.userAzureModel({ email, azureId, username, provider: 'azure' });
    return newUser.save();
  }

  // Trouver un utilisateur Google par email
  async findUserGoogle(email: string): Promise<UserGoogle | null> {
    return this.userGoogleModel.findOne({ email }).exec();
  }

  // Trouver un utilisateur Azure par email
  async findUserAzure(email: string): Promise<UserAzure | null> {
    return this.userAzureModel.findOne({ email }).exec();
  }

  // Trouver un utilisateur par ID (pour Google ou Azure)
  async findById(id: string): Promise<UserGoogle | UserAzure | null> {
    // Check the Google collection first
    const googleUser = await this.userGoogleModel.findById(id).exec();
    if (googleUser) {
      return googleUser;
    }

    // If not found in Google collection, check the Azure collection
    const azureUser = await this.userAzureModel.findById(id).exec();
    if (azureUser) {
      return azureUser;
    }

    // If no user is found, return null
    return null;
  }
}