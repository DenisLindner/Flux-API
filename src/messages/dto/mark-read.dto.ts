import { IsNotEmpty, IsString } from 'class-validator';

export class MarkReadDTO {
  @IsString({ message: 'O Id da mensagem deve ser um texto' })
  @IsNotEmpty({ message: 'Informe até qual mensagem a conversa foi lida' })
  throughId!: string;
}
