import { Injectable, UnauthorizedException } from '@nestjs/common';  // Ajoutez UnauthorizedException
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();  // Utilisez UnauthorizedException ici
    }
    return user;
  }
}




