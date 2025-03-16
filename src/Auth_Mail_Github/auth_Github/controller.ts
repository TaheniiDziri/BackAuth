import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'; // Importation des décorateurs et des types nécessaires
import { AuthGuard } from '@nestjs/passport'; // Importation du AuthGuard pour GitHub et JWT
import { AuthService } from './service'; // Importation du service d'authentification
import { Request, Response } from 'express'; // Importation des types Request et Response pour Express

// Vous pouvez également définir l'interface AuthenticatedUser si nécessaire
interface AuthenticatedUser {
  username: string;
  email: string;
  avatar: string;
  accessToken: string;
}

@Controller('auth/github')
export class AuthGithubController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    return { message: 'Redirecting to GitHub...' };
  }

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req: Request & { user: AuthenticatedUser }, @Res() res: Response) {
    console.log('GitHub User Data:', req.user);

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Crée le JWT
    const jwt = await this.authService.generateJwt(req.user);

    // Stocke le token dans un cookie sécurisé
    res.cookie('jwt', jwt.access_token, {
      httpOnly: true,
      secure: false, // Mettre `true` en production avec HTTPS
      sameSite: 'strict',
    });

    // Redirection vers le frontend avec le token et les données utilisateur
    return res.redirect(
      `http://localhost:5173/Home?token=${jwt.access_token}&username=${req.user.username}&email=${req.user.email}&avatar=${req.user.avatar}`
    );
  }

  @Get('user-data')
  @UseGuards(AuthGuard('jwt'))
  async getUserData(@Req() req: Request & { user: AuthenticatedUser }) {
    console.log('User in user-data endpoint:', req.user);

    if (!req.user) {
      return { message: 'User not authenticated' };
    }

    return {
      message: 'User data retrieved successfully',
      user: {
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        accessToken: req.user.accessToken,
      },
    };
  }
}
