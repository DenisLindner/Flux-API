import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'O Email deve ser um email válido' })
  email!: string;

  @IsString({ message: 'A Senha deve ser um texto' })
  @IsNotEmpty({ message: 'O Senha não pode ser vazia' })
  password!: string;
}
