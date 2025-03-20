import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Post,
  Res,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AzureGuard } from '../Auth_Azure_Google/guards/azure.guard';
import { GoogleOauthGuard } from '../Auth_Azure_Google/guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Assurez-vous d'importer le guard JWT

/*
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Cette méthode s'assure que les en-têtes COOP et COEP sont définis sur chaque réponse
  private setSecurityHeaders(res: Response) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    const googleId = user.googleId;

    if (!user || !googleId) {
      return res.status(HttpStatus.BAD_REQUEST).send('No user found');
    }

    const token = await this.authService.signIn(user, googleId, 'google');

    // Appliquer les en-têtes COOP et COEP
    this.setSecurityHeaders(res);

    // Ajouter le cookie sécurisé
    res.cookie('access_token', token, {
      maxAge: 2592000000, // 30 jours
      sameSite: 'none', // Autoriser les cookies tiers
      secure: process.env.NODE_ENV === 'production', // Utilisez `true` en production
      httpOnly: true, // Empêche l'accès via JavaScript
    });

    return res.status(HttpStatus.OK).json({
      message: 'Authentication successful',
      user: {
        email: user.email,
        googleId: user.googleId,
        username: user.username,
      },
      token: token,
    });
  }

  @Get('azure')
  @UseGuards(AzureGuard)
  async login() {}

  @Get('azure/redirect')
  @UseGuards(AzureGuard)
  async redirect() {
    return { message: 'Authentification réussie' };
  }

  @Post('google-auth')
  async googleAuth(@Body() body: { credential: string }, @Res() res: Response) {
    try {
      const token = body.credential; // Récupérer le token Google
      const user = await this.authService.validateGoogleToken(token); // Valider le token

      // Générer un JWT pour l'utilisateur
      const jwtToken = await this.authService.generateJwt({
        sub: user.id,
        email: user.email,
      });

      // Ajouter le cookie sécurisé
      res.cookie('access_token', jwtToken, {
        maxAge: 2592000000, // 30 jours
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });

      // Renvoyer les données de l'utilisateur dans la réponse
      return res.status(HttpStatus.OK).json({
        message: 'Authentication successful',
        token: jwtToken,
        user: {
          email: user.email,
          googleId: user.googleId,
          username: user.username,
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de l\'authentification Google',
      });
    }
  }

  @UseGuards(JwtAuthGuard) 
  @Get('me')
  getProfile(@Request() req) {
    
    return req.user; 
  }
}*/

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Cette méthode s'assure que les en-têtes COOP et COEP sont définis sur chaque réponse
  private setSecurityHeaders(res: Response) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    const googleId = user.googleId;

    if (!user || !googleId) {
      return res.status(HttpStatus.BAD_REQUEST).send('No user found');
    }

    const token = await this.authService.signIn(user, googleId, 'google');
    this.setSecurityHeaders(res);

    res.cookie('access_token', token, {
      maxAge: 2592000000, // 30 jours
      sameSite: 'none', // Autoriser les cookies tiers
      secure: process.env.NODE_ENV === 'production', // Utilisez `true` en production
      httpOnly: true, // Empêche l'accès via JavaScript
    });

    return res.status(HttpStatus.OK).json({
      message: 'Authentication successful',
      user: {
        email: user.email,
        googleId: user.googleId,
        username: user.username,
      },
      token: token,
    });
  }

  @Get('azure')
  @UseGuards(AzureGuard)
  async login() {}

  @Get('azure/redirect')
  @UseGuards(AzureGuard)
  async redirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(HttpStatus.BAD_REQUEST).send('No user found');
    }

    const azureId = user.azureId;
    const token = await this.authService.signIn(user, azureId, 'azuread');
    this.setSecurityHeaders(res);

    res.cookie('access_token', token, {
      maxAge: 2592000000, // 30 jours
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return res.status(HttpStatus.OK).json({
      message: 'Authentication successful',
      user: {
        email: user.email,
        azureId: user.azureId,
        username: user.username,
      },
      token: token,
    });
  }

@Post('google-auth')
async googleAuth(@Body() body: { credential: string }, @Res() res: Response) {
  try {
    const token = body.credential; // Récupérer le token Google
    const user = await this.authService.validateGoogleToken(token); // Valider le token

    // Générer un JWT pour l'utilisateur
    const jwtToken = await this.authService.generateJwt({
      sub: user.id,
      email: user.email,
    });

    // Ajouter le cookie sécurisé
    res.cookie('access_token', jwtToken, {
      maxAge: 2592000000, // 30 jours
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return res.status(HttpStatus.OK).json({
      message: 'Authentication successful',
      token: jwtToken,
      user: {
        id: user.id, // Inclure l'ID de l'utilisateur
        email: user.email,
        googleId: user.googleId,
        username: user.username,
        name: user.name, // Inclure le nom complet
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de l\'authentification Google',
    });
  }
}

}
