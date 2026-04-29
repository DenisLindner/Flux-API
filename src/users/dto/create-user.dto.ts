import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
  NotContains,
} from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'O Nome de Usuário deve ser um texto' })
  @IsNotEmpty({ message: 'O Nome de Usuário não pode ser vazio' })
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
  username!: string;

  @IsString({ message: 'O Nome deve ser um texto' })
  @IsNotEmpty({ message: 'O Nome não pode ser vazio' })
  @MinLength(4, { message: 'O Nome deve ter no minímo 4 caracteres' })
  @MaxLength(60, { message: 'O Nome deve ter no máximo 60 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'O Email deve ser um email válido' })
  email!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'A Senha deve ter no mínimo: 8 caracteres de tamanho, 1 número, 1 símbolo, 1 letra maiúscula',
    },
  )
  password!: string;
}
