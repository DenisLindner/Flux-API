import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDTO {
  @IsString({ message: 'O Conteúdo deve ser um texto' })
  @MinLength(1, { message: 'O Conteúdo deve ter no minímo 1 caracteres' })
  @MaxLength(255, { message: 'O Conteúdo deve ter no máximo 255 caracteres' })
  @IsOptional()
  content?: string;
}
