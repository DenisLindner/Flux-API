import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDTO {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  content?: string;
}
