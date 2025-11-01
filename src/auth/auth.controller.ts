import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { access_token, user } = await this.authService.login(loginDto);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure uniquement en prod
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // important pour HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        path: '/', // assure la disponibilité sur tout le domaine
      });

      res.status(HttpStatus.OK).json({
        user,
        // access_token,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
    return;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Déconnexion réussie' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUserId() userId: string) {
    return this.authService.getAuthenticatedUser(userId);
  }
}
