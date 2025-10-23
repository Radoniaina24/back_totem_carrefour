import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_KEY');
    if (!jwtSecret) {
      throw new Error('JWT_KEY is missing from .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }

  // private static extractJWT(req: Request): string | null {
  //   if (
  //     req.cookies &&
  //     'access_token' in req.cookies &&
  //     req.cookies.user_token > 0
  //   ) {
  //     return req.cookies.user_token;
  //   }
  //   return null;
  // }

  private static extractJWT(req: Request): string | null {
    // console.log('Cookies reçus :', req.cookies);
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }
}
