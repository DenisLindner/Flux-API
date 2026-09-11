import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDTO } from './create-user.dto';

const validUser = {
  username: 'maria.silva',
  name: 'Maria Silva',
  email: 'maria.silva@weg.net',
  password: 'Senha@123',
};

describe('CreateUserDTO', () => {
  it('aceita email corporativo da WEG', async () => {
    const errors = await validate(plainToInstance(CreateUserDTO, validUser));

    expect(errors).toHaveLength(0);
  });

  it('rejeita email que não termina com @weg.net', async () => {
    const user = { ...validUser, email: 'maria@gmail.com' };
    const errors = await validate(plainToInstance(CreateUserDTO, user));

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });
});
