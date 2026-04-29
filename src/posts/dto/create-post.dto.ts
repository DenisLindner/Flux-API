import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDTO {
  @IsString({ message: 'O Conteúdo deve ser um texto' })
  @IsNotEmpty({ message: 'O Conteúdo não pode ser vazio' })
  @MinLength(1, { message: 'O Conteúdo deve ter no minímo 1 caracteres' })
  @MaxLength(255, { message: 'O Conteúdo deve ter no máximo 255 caracteres' })
  content!: string;

  @IsString({ message: 'O Id do Post Pai deve ser um texto' })
  @IsOptional()
  parentId?: string;
}
