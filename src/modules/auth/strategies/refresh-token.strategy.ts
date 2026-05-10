import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'fallbackSecret',
      passReqToCallback: true,
    } as any);
  }

  validate(req: Request, payload: any) {
    const authorizationHeader = req.get('Authorization');
    const refreshToken = authorizationHeader
      ? authorizationHeader.replace('Bearer', '').trim()
      : '';
    return { ...payload, refreshToken };
  }
}
