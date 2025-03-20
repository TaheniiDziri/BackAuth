import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateFromEmail } from 'unique-username-generator';
import { UserGoogle } from './users/entities/UserGoogle.entity';
import { RegisterUserDto } from './dtos/auth.dto';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import * as qs from 'qs';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    @InjectModel(UserGoogle.name) private userModel: Model<UserGoogle>,
    private readonly httpService: HttpService,
  ) {
    // Initialize Google OAuth2 Client
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
  }

  generateJwt(payload: any) {
    return this.jwtService.sign(payload);
  }

  async signIn(user: any, externalId: string, provider: 'google' | 'azuread') {
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


async registerUser(user: RegisterUserDto, externalId: string, provider: 'google' | 'azuread', googleProfile?: any) {
  try {
    const newUser = new this.userModel(user);

    if (provider === 'google' && googleProfile) {
      // Utiliser le nom complet de Google comme username
      newUser.username = googleProfile.name || googleProfile.given_name || user.email.split('@')[0];
      // Sauvegarder le nom complet dans le champ `name`
      newUser.name = googleProfile.name; // Assurez-vous que ce champ existe dans votre modèle
    } else {
      // Utiliser la partie avant le @ de l'email comme username
      newUser.username = user.username || user.email.split('@')[0];
    }

    newUser[`${provider}Id`] = externalId;
    newUser.provider = provider;

    await newUser.save();

    // Générer le token JWT
    const token = this.generateJwt({
      sub: newUser.id,
      email: newUser.email,
    });

    // Renvoyer l'utilisateur et le token avec le `name` inclus
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name, // Inclure le nom complet dans la réponse
        username: newUser.username, // Optionnel : inclure le username si nécessaire
      },
      token: token,
    };
  } catch (error) {
    throw new InternalServerErrorException('Error during registration');
  }
}
  


  async findUserByEmail(email: string) {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error during user search');
    }
  }



  async validateGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID_FRONT,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google token payload');
      }

      let user = await this.userModel.findOne({ email: payload.email }).exec();

      if (!user) {
        user = new this.userModel({
          email: payload.email,
          username: generateFromEmail(payload.email, 5),
          googleId: payload.sub,
          provider: 'google',
        });
        await user.save();
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error during Google token validation');
    }
  }


  async validateAzureToken(token: string) {
    try {
      const response = await this.httpService
        .post('https://graph.microsoft.com/v1.0/me', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .toPromise();

      if (!response) {
        throw new BadRequestException('No response from Azure');
      }

      const user = response.data;
      if (!user) {
        throw new BadRequestException('Invalid Azure token');
      }

      let existingUser = await this.userModel.findOne({ email: user.mail }).exec();

      if (!existingUser) {
        existingUser = new this.userModel({
          email: user.mail,
          username: generateFromEmail(user.mail, 5),
          azureId: user.id,
          provider: 'azuread',
        });
        await existingUser.save();
      }

      return existingUser;
    } catch (error) {
      throw new InternalServerErrorException('Error during Azure token validation');
    }
  }
}


/*

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
    @InjectModel(UserGoogle.name) private userModel: Model<UserGoogle>,
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.AZURE_CLIENT_ID!;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET!;
    this.tenantId = process.env.AZURE_TENANT_ID!;
    this.scope = process.env.AZURE_SCOPE!;

    if (!this.clientId || !this.clientSecret || !this.tenantId || !this.scope) {
      throw new Error(
        'Azure environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_SCOPE) must be set',
      );
    }

    this.tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    // Initialisation du client Google OAuth2
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
  }

  generateJwt(payload: any) {
    return this.jwtService.sign(payload);
  }

  async signIn(user: any, externalId: string, provider: 'google' | 'azuread') {
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

async registerUser(
  user: RegisterUserDto,
  externalId: string,
  provider: 'google' | 'azuread',
) {
  try {
    console.log('Enregistrement d\'un nouvel utilisateur...');
    
    // Créer un nouvel utilisateur avec les informations fournies
    const newUser = new this.userModel(user);
    
    // Si le provider est Google, vous pouvez récupérer le nom d'utilisateur de Google
    if (provider === 'google') {
      newUser.username = user.username || user.email.split('@')[0]; // Utiliser le nom d'utilisateur de Google, ou l'email si nécessaire
    } else {
      newUser.username = generateFromEmail(user.email, 5); // Utiliser la génération si ce n'est pas Google
    }
    
    // Ajouter l'ID externe et le provider (Google ou Azure AD)
    newUser[`${provider}Id`] = externalId;
    newUser.provider = provider;

    // Sauvegarder l'utilisateur dans la base de données
    await newUser.save();
    console.log('Utilisateur enregistré avec succès:', newUser);

    // Générer et retourner le JWT
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
      throw new InternalServerErrorException(
        'Erreur lors de la recherche de l\'utilisateur',
      );
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
      const response: AxiosResponse<any> | undefined =
        await this.httpService
          .post(this.tokenUrl, tokenRequestData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .toPromise();

      if (response && response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Token not received in the response');
      }
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Azure:', error);
      throw new InternalServerErrorException(
        `Erreur lors de l'obtention du token Azure: ${
          error.response ? error.response.data : error.message
        }`,
      );
    }
  }

  async validateGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID_FRONT, // Assurez-vous que l'audience correspond à votre client Google
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
          googleId: payload.sub, // Stocker l'ID Google
          provider: 'google',
        });
        await user.save();
        console.log('Utilisateur créé:', user);
        return user;
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token Google:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la validation du token Google',
      );
    }
  }
}*/