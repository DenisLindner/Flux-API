import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDTO {
  @IsInt({ message: 'O Conteúdo deve ser um número' })
  @Type(() => Number)
  @Min(0, { message: 'O Conteúdo deve ser maior que 0' })
  @IsOptional()
  take?: number = 10;

  @IsInt({ message: 'O Conteúdo deve ser um número' })
  @Type(() => Number)
  @Min(0, { message: 'O Conteúdo deve ser maior que 0' })
  @IsOptional()
  skip?: number = 0;
}
