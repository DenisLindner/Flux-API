import {
  IsAlphanumeric,
  IsLowercase,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  NotContains,
} from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(60)
  @IsLowercase()
  @NotContains(' ', { message: 'The username cannot have blank spaces' })
  @IsAlphanumeric('en-US')
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(60)
  @IsOptional()
  name?: string;
}
