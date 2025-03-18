import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './service';

@Controller('auth/github')
export class GithubAuthController {
  constructor(private readonly githubAuthService: AuthService) {}

  @Get('token')
  async getToken(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Code GitHub manquant' });
    }

    try {
      const accessToken = await this.githubAuthService.getAccessToken(code);
      return res.status(HttpStatus.OK).json({ access_token: accessToken });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
