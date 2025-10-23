import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpStatus,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'RH')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.userService.create(createUserDto);
      res.status(HttpStatus.CREATED).json({
        message: 'Utilisateur créé avec succès',
        user,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'RH')
  @Get()
  async findAll(
    @CurrentUserId() userId: string,
    @Res() res: Response,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('roles') roles?: string,
  ) {
    try {
      const users = await this.userService.findAll(userId, {
        page: Number(page),
        limit: Number(limit),
        search,
        roles: roles?.split(','),
      });
      res.status(HttpStatus.OK).json({
        users,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'employee', 'RH')
  @Get('/tasks')
  async findAllUserFor(@Res() res: Response) {
    try {
      const users = await this.userService.findAllUserForTasks();
      res.status(HttpStatus.OK).json({
        users,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'RH')
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.userService.findOne(id);
      res.status(HttpStatus.OK).json({
        user,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'RH')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      res.status(HttpStatus.CREATED).json({
        message: 'Utilisateur mis à jour avec succès',
        user,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'RH')
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.userService.remove(id);
      res.status(HttpStatus.OK).json({
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
}
