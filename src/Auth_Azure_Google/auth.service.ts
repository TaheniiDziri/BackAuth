
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateFromEmail } from 'unique-username-generator';
import { User } from './users/entities/user.entity';
import { RegisterUserDto } from './dtos/auth.dto';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as qs from 'qs';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tenantId: string;
  private readonly scope: string;
  private readonly tokenUrl: string;
  private readonly googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.AZURE_CLIENT_ID!;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET!;
    this.tenantId = process.env.AZURE_TENANT_ID!;
    this.scope = process.env.AZURE_SCOPE!;

    if (!this.clientId || !this.clientSecret || !this.tenantId || !this.scope) {
      throw new Error('Azure environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_SCOPE) must be set');
    }

    this.tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    // Initialisation du client Google OAuth2
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
  }

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async signIn(user, externalId: string, provider: 'google' | 'azuread') {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.findUserByEmail(user.email);

    if (!userExists) {
      return this.registerUser(user, externalId, provider);
    }

    return this.generateJwt({
      sub: userExists.id,
      email: userExists.email,
    });
  }

  async registerUser(user: RegisterUserDto, externalId: string, provider: 'google' | 'azuread') {
    try {
      console.log('Enregistrement d\'un nouvel utilisateur...');
      const newUser = new this.userModel(user);
      newUser.username = generateFromEmail(user.email, 5);
      newUser[`${provider}Id`] = externalId;
      newUser.provider = provider;

      // Sauvegarde de l'utilisateur dans la base de données
      await newUser.save();
      console.log('Utilisateur enregistré avec succès:', newUser);

      return this.generateJwt({
        sub: newUser.id,
        email: newUser.email,
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
      throw new InternalServerErrorException('Erreur pendant l\'inscription');
    }
  }

  async findUserByEmail(email: string) {
    try {
      console.log('Recherche de l\'utilisateur avec l\'email:', email);
      const user = await this.userModel.findOne({ email }).exec();

      if (user) {
        console.log('Utilisateur trouvé:', user);
      } else {
        console.log('Aucun utilisateur trouvé pour cet email');
      }

      return user;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      throw new InternalServerErrorException('Erreur lors de la recherche de l\'utilisateur');
    }
  }

  async getAzureToken(): Promise<string> {
    const tokenRequestData = qs.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scope,
      grant_type: 'client_credentials',
    });

    try {
      const response: AxiosResponse<any> | undefined = await this.httpService.post(this.tokenUrl, tokenRequestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).toPromise();

      if (response && response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Token not received in the response');
      }
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Azure:', error);
      throw new InternalServerErrorException(`Erreur lors de l'obtention du token Azure: ${error.response ? error.response.data : error.message}`);
    }
  }

  // Validation du token Google
  async validateGoogleToken(token: string) {
    try {
      console.log('Décodage du token Google...');
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Assurez-vous que l'audience correspond à votre client Google
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google token payload');
      }

      // Chercher un utilisateur avec l'email du payload
      let user = await this.userModel.findOne({ email: payload.email }).exec();

      if (user) {
        console.log('Utilisateur trouvé:', user);
        return user;
      } else {
        console.log('Utilisateur non trouvé, création d\'un nouvel utilisateur...');
        // Créer un nouvel utilisateur
        user = new this.userModel({
          email: payload.email,
          username: generateFromEmail(payload.email, 5),
          googleId: payload.sub,  // Stocker l'ID Google
          provider: 'google',
        });
        await user.save();
        console.log('Utilisateur créé:', user);
        return user;
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token Google:', error);
      throw new InternalServerErrorException('Erreur lors de la validation du token Google');
    }
  }
}
