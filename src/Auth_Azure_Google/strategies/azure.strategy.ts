import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OIDCStrategy } from 'passport-azure-ad'; // Use OIDCStrategy
import { AuthService } from '../auth.service';

@Injectable()
export class AzureStrategy extends PassportStrategy(OIDCStrategy, 'azuread') {
  constructor(private authService: AuthService) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID as string,
      clientSecret: process.env.AZURE_CLIENT_SECRET as string,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: process.env.AZURE_REDIRECT_URI as string,
      scope: ['openid', 'profile', 'email'],
      allowHttpForRedirectUrl: true, // Allow non-HTTPS redirect URIs (for development only)
      passReqToCallback: true, // Add this property
    });
  }

  async validate(req: any, iss: string, sub: string, profile: any, done: Function) {
    const user = await this.authService.validateAzureToken(profile.oid); // Use profile.oid or profile.id_token
    done(null, user);
  }
}