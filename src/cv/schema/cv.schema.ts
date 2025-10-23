import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ====================
// 🧩 Sous-schemas
// ====================

@Schema({ _id: false })
export class PersonalInfo {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  zipCode: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, trim: true })
  professionalTitle: string;

  @Prop({ required: true, trim: true })
  profileSummary: string;

  @Prop()
  photo?: string;
}

export const PersonalInfoSchema = SchemaFactory.createForClass(PersonalInfo);

@Schema({ _id: false })
export class Experience {
  @Prop({ required: true, trim: true })
  jobTitle: string;

  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: false })
  currentJob: boolean;

  @Prop({ trim: true })
  description: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

@Schema({ _id: false })
export class Education {
  @Prop({ required: true, trim: true })
  degree: string;

  @Prop({ required: true, trim: true })
  institution: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: false })
  currentStudy: boolean;

  @Prop({ trim: true })
  description: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);

@Schema({ _id: false })
export class Skill {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

@Schema({ _id: false })
export class Language {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    enum: ['basic', 'conversational', 'fluent', 'native'],
  })
  level: 'basic' | 'conversational' | 'fluent' | 'native';
}

export const LanguageSchema = SchemaFactory.createForClass(Language);

// ====================
//  CV Principal
// ====================

@Schema({ timestamps: true })
export class CVData extends Document {
  @Prop({ type: PersonalInfoSchema, required: true })
  personalInfo: PersonalInfo;

  @Prop({ type: [ExperienceSchema], default: [] })
  experiences: Experience[];

  @Prop({ type: [EducationSchema], default: [] })
  education: Education[];

  @Prop({ type: [SkillSchema], default: [] })
  skills: Skill[];

  @Prop({ type: [LanguageSchema], default: [] })
  languages: Language[];
}

export const CVDataSchema = SchemaFactory.createForClass(CVData);

export type CvDocument = CVData & Document;
