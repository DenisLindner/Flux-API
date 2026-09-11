import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class SearchUsersDTO {
  @IsString({ message: 'q deve ser um texto' })
  @IsNotEmpty({ message: 'q não pode ser vazio' })
  @MinLength(2, { message: 'q deve ter pelo menos 2 caracteres' })
  q!: string;

  @Type(() => Number)
  @IsInt({ message: 'take deve ser um número inteiro' })
  @Min(1, { message: 'take deve ser maior que zero' })
  @Max(50, { message: 'take deve ser no máximo 50' })
  take = 20;

  @Type(() => Number)
  @IsInt({ message: 'skip deve ser um número inteiro' })
  @Min(0, { message: 'skip não pode ser negativo' })
  skip = 0;
}
