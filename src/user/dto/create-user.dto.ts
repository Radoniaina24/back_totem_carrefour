import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName: string;

  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName: string;

  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;

  @IsArray({ message: 'Le rôle doit être un tableau' })
  @ArrayNotEmpty({ message: 'Le tableau de rôles ne doit pas être vide' })
  @IsEnum(['manager', 'admin', 'employee'], {
    each: true,
    message: 'Rôle invalide',
  })
  roles: ('manager' | 'admin' | 'employee'|'RH')[];
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @IsMongoId()
  @IsOptional()
  serviceId?: string;

  @IsMongoId()
  @IsOptional()
  managerId?: string;
}
