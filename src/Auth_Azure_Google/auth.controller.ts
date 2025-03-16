
import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Post,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AzureGuard } from '../Auth_Azure_Google/guards/azure.guard';
import { GoogleOauthGuard } from '../Auth_Azure_Google/guards/google-oauth.guard';

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
      sameSite: 'none',  // Autoriser les cookies tiers
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

  @Post('google')
  async googleAuth(@Body() body: { token: string }) {
    return this.authService.validateGoogleToken(body.token);
  }

  @Get('azure')
  @UseGuards(AzureGuard)
  async login() {}

  @Get('azure/redirect')
  @UseGuards(AzureGuard)
  async redirect() {
    return { message: 'Authentification réussie' };
  }
}
