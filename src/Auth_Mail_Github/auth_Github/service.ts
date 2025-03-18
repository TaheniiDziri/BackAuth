import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async getAccessToken(code: string): Promise<string> {
    const CLIENT_ID = 'Ov23li6PUhkBMT7M9NFg';
    const CLIENT_SECRET = 'f58c8c2bb2212d17cf239c8b16dc0915a3103d9e';
    const REDIRECT_URI = 'http://localhost:5173/';

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post('https://github.com/login/oauth/access_token', null, {
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
          },
          headers: {
            Accept: 'application/json',
          },
        })
      );

      if (response.data.error) {
        console.error('Erreur OAuth GitHub:', response.data.error_description);
        throw new Error(`GitHub OAuth Error: ${response.data.error_description}`);
      }

      if (!response.data.access_token) {
        console.error('Token d\'accès manquant');
        throw new Error('Token d\'accès manquant');
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Erreur lors de l\'échange du code GitHub:', error.message);
      throw new Error(`Erreur lors de l'échange du code GitHub: ${error.message}`);
    }
  }
}