import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Datos requeridos para crear una cuenta nueva. class-validator valida
 * esto automáticamente antes de llegar al controller (ValidationPipe
 * global en main.ts).
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
