import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'UsersAzure' }) // Collection séparée pour Azure
export class UserAzure extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  azureId: string;

  @Prop()
  username: string;

  @Prop({ default: 'azure' }) // Marqueur du fournisseur
  provider: string;
}

export const UserAzureSchema = SchemaFactory.createForClass(UserAzure);
