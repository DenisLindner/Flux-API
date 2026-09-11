import {
  IsLowercase,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  NotContains,
} from 'class-validator';

export class UpdateUserDTO {
  @IsString({ message: 'O Nome de Usuário deve ser um texto' })
  @MinLength(4, {
    message: 'O Nome de Usuário deve ter no minímo 4 caracteres',
  })
  @MaxLength(60, {
    message: 'O Nome de Usuário deve ter no máximo 60 caracteres',
  })
  @IsLowercase({ message: 'O Nome de Usuário deve ser em letra minúscula' })
  @NotContains(' ', {
    message: 'O Nome de Usuário não pode ter espaços em branco',
  })
  @Matches(/^[A-Za-z0-9.-_]+$/, {
    message: 'O Nome de Usuário deve ter apenas letras, números, ., _ e -',
  })
  @IsOptional()
  username?: string;

  @IsString({ message: 'O Nome deve ser um texto' })
  @MinLength(4, { message: 'O Nome deve ter no minímo 4 caracteres' })
  @MaxLength(60, { message: 'O Nome deve ter no máximo 60 caracteres' })
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'A URL do avatar deve ser válida' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'A biografia deve ser um texto' })
  @MaxLength(160, { message: 'A biografia deve ter no máximo 160 caracteres' })
  bio?: string;
}
