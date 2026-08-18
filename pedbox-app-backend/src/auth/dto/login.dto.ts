import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

/** Credenciales para iniciar sesión. */
export class LoginDto {
  @ApiProperty({ example: 'usuario@pedbox.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}
