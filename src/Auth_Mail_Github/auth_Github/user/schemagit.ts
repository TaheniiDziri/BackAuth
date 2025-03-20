import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'; // Add this import
import { Document } from 'mongoose';
 
@Schema()
export class UserProfil extends Document {
  @Prop({ required: true })
  token: string;
 
  @Prop({ required: true })
  login: string; // GitHub username
 
  @Prop({ required: true })
  githubId: number; // Rename 'id' to 'githubId'  
 
  @Prop({ required: true })
  avatarUrl: string; // Avatar URL
 
  @Prop({ required: true })
  htmlUrl: string; // GitHub profile URL
 
  @Prop({ required: true })
  followers: number; // Followers count
 
  @Prop({ required: true })
  following: number; // Following count
 
  @Prop({ required: true })
  publicRepos: number; // Public repositories count
 
  @Prop({ required: true })
  createdAt: string; // Account creation date
 
  @Prop({ required: true })
  updatedAt: string; // Last updated date
}
 
export const UserSchemaProfil = SchemaFactory.createForClass(UserProfil)