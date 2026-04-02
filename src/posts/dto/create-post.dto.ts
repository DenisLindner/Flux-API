import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
