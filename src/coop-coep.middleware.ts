// coop-coep.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CoopCoepMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Ajoutez les en-têtes COOP et COEP
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  }
}
