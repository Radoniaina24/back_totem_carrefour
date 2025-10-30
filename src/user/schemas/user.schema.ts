// src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false, // Ne pas renvoyer le mot de passe par défaut
  })
  password: string;

  @Prop({
    type: [String],
    enum: ['admin', 'candidate', 'recruiter'],
    required: true,
    default: ['candidate'],
  })
  roles: ('admin' | 'candidate' | 'recruiter')[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware pour hacher le mot de passe avant la sauvegarde
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
