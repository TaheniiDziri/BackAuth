import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
/*
@Schema({ collection: 'UsersGoogle' })  // Spécifier le nom de la collection
export class UserGoogle extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  googleId: string;

  @Prop()
  username: string;

  @Prop()
  provider: string;
}

export const UserGoogleSchema = SchemaFactory.createForClass(UserGoogle);
*/


@Schema({ collection: 'UsersGoogle' })  // Spécifier le nom de la collection
export class UserGoogle extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  googleId: string;

  @Prop()
  username: string;

  @Prop()
  provider: string;

  @Prop() // Ajouter un champ pour le nom complet
  name: string;
}

export const UserGoogleSchema = SchemaFactory.createForClass(UserGoogle);