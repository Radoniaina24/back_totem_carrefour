import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// ====================
// ENUMS
// ====================
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum LanguageLevel {
  BASIC = 'basic',
  CONVERSATIONAL = 'conversational',
  FLUENT = 'fluent',
  NATIVE = 'native',
}

// ====================
// Sous-DTOs
// ====================

export class PersonalInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;

  @IsString()
  professionalTitle: string;

  @IsString()
  profileSummary: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

export class ExperienceDto {
  @IsString()
  jobTitle: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsBoolean()
  currentJob: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class EducationDto {
  @IsString()
  degree: string;

  @IsString()
  institution: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsBoolean()
  currentStudy: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SkillDto {
  @IsString()
  name: string;

  @IsEnum(SkillLevel)
  level: SkillLevel;
}

export class LanguageDto {
  @IsString()
  name: string;

  @IsEnum(LanguageLevel)
  level: LanguageLevel;
}

// ====================
// CV Principal DTO
// ====================

export class CreateCvDto {
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences: ExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education: EducationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages: LanguageDto[];
}
