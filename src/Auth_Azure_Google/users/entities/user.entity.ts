
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: false }) 
  username?: string;

  @Prop({ required: false }) 
  password?: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false })
  azureId?: string;

  @Prop({ required: false, enum: ['google', 'azuread'] })
  provider: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
