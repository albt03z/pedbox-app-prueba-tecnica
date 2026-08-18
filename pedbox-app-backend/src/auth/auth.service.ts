import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/** Costo del hash bcrypt. 10 es el estándar recomendado (balance seguridad/latencia). */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Lógica de autenticación: registro (hashea la contraseña con bcrypt,
 * nunca se guarda en texto plano) y login (verifica credenciales y
 * emite un JWT firmado).
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
    });
    await this.userRepository.save(user);

    return this.signToken(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.signToken(user);
  }

  /**
   * Firma el JWT con el id y email del usuario como payload.
   * Se usa el mismo mensaje genérico "Credenciales inválidas" tanto si
   * el email no existe como si la contraseña no coincide, para no
   * filtrar (mediante el mensaje de error) qué emails están registrados.
   */
  private signToken(user: User): { accessToken: string } {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
