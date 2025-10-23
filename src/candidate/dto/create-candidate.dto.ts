import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../schema/candidate.schema';

export class CreateCandidateDto {
  @ApiProperty({
    description: "Candidate's full name",
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: "Candidate's date of birth in ISO format (YYYY-MM-DD)",
    example: '1990-05-15',
  })
  @IsDateString({}, { message: 'Invalid date format for date of birth' })
  dateOfBirth: string;

  @ApiProperty({
    description: "Candidate's gender",
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Other' })
  gender: Gender;

  @ApiProperty({
    description: 'Full residential address of the candidate',
    example: '123 Main Street, Antananarivo, Madagascar',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full address is required' })
  fullAddress: string;

  @ApiProperty({
    description: 'Candidate phone number (international format preferred)',
    example: '+261 32 12 345 67',
  })
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,20}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Professional email address of the candidate',
    example: 'john.doe@company.com',
  })
  @IsEmail({}, { message: 'Invalid professional email address' })
  professionalEmail: string;

  @ApiProperty({
    description: "Candidate's nationality",
    example: 'Malagasy',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nationality is required' })
  nationality: string;

  @ApiProperty({
    description: 'Country of residence',
    example: 'Madagascar',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @ApiPropertyOptional({
    description: 'Optional file URL (e.g., CV or profile picture)',
    example: 'https://example.com/uploads/cv-john-doe.pdf',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'File must be a valid URL' })
  file: string;
}
