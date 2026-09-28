import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDTO {
  @IsString({ message: 'O Conteúdo deve ser um texto' })
  @MaxLength(255, { message: 'O Conteúdo deve ter no máximo 255 caracteres' })
  @IsOptional()
  content?: string;

  @IsString({ message: 'O Id do Post Pai deve ser um texto' })
  @IsOptional()
  parentId?: string;
}
