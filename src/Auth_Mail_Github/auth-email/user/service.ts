import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec(); 
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    
    const user = new this.userModel({
      username,
      email,
      password,
    });
    return user.save();
  }
}