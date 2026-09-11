import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDTO {
  @IsString({ message: 'A mensagem deve ser um texto' })
  @IsNotEmpty({ message: 'A mensagem não pode ser vazia' })
  @MinLength(1, { message: 'A mensagem deve ter pelo menos 1 caractere' })
  @MaxLength(1000, { message: 'A mensagem deve ter no máximo 1000 caracteres' })
  content!: string;
}
