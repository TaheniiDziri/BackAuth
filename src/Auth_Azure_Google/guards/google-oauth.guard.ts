import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  handleRequest(err, user, info, context) {
    console.log('Google OAuth Guard activated');
    if (err || !user) {
      console.error('Error or no user found:', err);
      throw err || new Error('User not authenticated');
    }
    console.log('User authenticated:', user);
    return user;
  }
}
