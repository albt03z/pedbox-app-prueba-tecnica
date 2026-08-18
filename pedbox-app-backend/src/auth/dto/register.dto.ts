import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Datos requeridos para crear una cuenta nueva. class-validator valida
 * esto automáticamente antes de llegar al controller (ValidationPipe
 * global en main.ts).
 */
export class RegisterDto {
  @ApiProperty({ example: 'usuario@pedbox.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
