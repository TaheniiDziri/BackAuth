

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Créer un utilisateur avec un email, un nom d'utilisateur et un mot de passe
  async createUser(email: string, username: string, password: string): Promise<User> {
    const newUser = new this.userModel({ email, username, password });
    return newUser.save();
  }
/*
  // Créer un utilisateur via Google (enregistrer l'utilisateur avec le googleId)
  async createUserWithGoogle(
    email: string,
    username: string,
    googleId: string,
    name: string,
    picture: string,
  ): Promise<User> {
    const newUser = new this.userModel({
      email,
      username,
      googleId,
      name,
      picture,
    });
    return newUser.save();
  }

  // Trouver un utilisateur par son email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  // Trouver un utilisateur par son googleId
  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId });
  }
    */
}
