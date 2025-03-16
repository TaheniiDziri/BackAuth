import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OIDCStrategy } from 'passport-azure-ad';

@Injectable()
export class AzureAuthStrategy extends PassportStrategy(OIDCStrategy, 'azure') {
  constructor(private configService: ConfigService) {
    const redirectUrl = process.env.AZURE_REDIRECT_URL;

    if (!redirectUrl) {
      throw new Error('Redirect URL is not defined in the environment variables');
    }

    console.log('Redirect URL:', redirectUrl);

    super({
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/.well-known/openid-configuration`,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl,
      scope: ['openid', 'profile', 'email'],
      passReqToCallback: true,
      allowHttpForRedirectUrl: true,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
