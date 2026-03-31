import { Role } from 'src/generated/prisma/enums';

export class CurrentUserDTO {
  sub: string;
  email: string;
  role: Role;
}
