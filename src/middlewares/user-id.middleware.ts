import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Optionnel : tu peux extraire ce type dans un fichier global
interface AuthPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
}



@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['access_token'];
    // console.log(token);
    if (!token) {
      throw new UnauthorizedException('Token manquant dans les cookies.');
    }
    const secret = process.env.JWT_KEY;

    if (!secret) {
      throw new Error(
        'JWT_SECRET n’est pas défini dans les variables d’environnement',
      );
    }
    try {
      const decoded = jwt.verify(token, secret) as AuthPayload;
      // console.log(decoded);
      if (!decoded.sub || !decoded.roles) {
        throw new UnauthorizedException('Payload JWT invalide');
      }

      req['userId'] = decoded.sub;
      req['userRole'] = decoded.roles;

      next();
    } catch (err) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }
  }
}
