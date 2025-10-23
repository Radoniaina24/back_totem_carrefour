import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDate,
  Matches,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export type CandidateDocument = Candidate & Document;

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true, trim: true })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @Prop({ type: Date, required: true })
  @IsDate({ message: 'Invalid date format for date of birth' })
  dateOfBirth: Date;

  @Prop({ type: String, enum: Gender, required: true })
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Other' })
  gender: Gender;

  @Prop({ required: true, trim: true })
  @IsString()
  @IsNotEmpty({ message: 'Full address is required' })
  fullAddress: string;

  @Prop({ required: true, trim: true })
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,20}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  @IsEmail({}, { message: 'Invalid professional email address' })
  professionalEmail: string;

  @Prop({ required: true, trim: true })
  @IsString()
  @IsNotEmpty({ message: 'Nationality is required' })
  nationality: string;

  @Prop({ required: true, trim: true })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @Prop({ type: String, required: false, trim: true })
  @IsOptional()
  @IsString({ message: 'File must be a string path or URL' })
  @IsUrl({}, { message: 'File must be a valid URL' })
  file: string;
}
export const CandidateSchema = SchemaFactory.createForClass(Candidate);
