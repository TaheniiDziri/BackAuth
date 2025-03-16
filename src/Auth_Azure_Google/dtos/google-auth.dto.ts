// google-auth.dto.ts
import { IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  token: string;
}
