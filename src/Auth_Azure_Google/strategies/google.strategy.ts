import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { User } from '../users/entities/user.entity';  // Assurez-vous que le modèle est correct
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>, // Injection du modèle User
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    const { id: googleId, name, emails, photos } = profile;

    // Vérifiez que l'email est présent dans le profil
    if (!emails || !emails[0] || !emails[0].value) {
      throw new Error('Email not found in Google profile');
    }

    // Construire l'objet utilisateur
    const user = {
      provider: 'google',
      googleId,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0]?.value || '',  // Utilisez une valeur par défaut si la photo n'est pas disponible
      username: emails[0].value.split('@')[0],  // Générer un nom d'utilisateur simple basé sur l'email
    };

    // Recherche ou création de l'utilisateur
    let existingUser = await this.userModel.findOne({ $or: [{ googleId }, { email: user.email }] });

    if (existingUser) {
      return existingUser; // Retourner l'utilisateur existant
    }

    // Création d'un nouvel utilisateur si non existant
    const newUser = new this.userModel(user);
    await newUser.save();

    return newUser; // Retourner le nouvel utilisateur
  }
}
