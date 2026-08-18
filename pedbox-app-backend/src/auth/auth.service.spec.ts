import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('lanza ConflictException si el email ya está registrado', async () => {
      userRepository.findOne.mockResolvedValue({ id: '1' } as User);

      await expect(
        authService.register({
          email: 'test@pedbox.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashea la contraseña (nunca la guarda en texto plano) y devuelve un accessToken', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const savedUser = {
        id: '1',
        email: 'test@pedbox.com',
        passwordHash: 'hashed',
      } as User;
      userRepository.create.mockReturnValue(savedUser);
      userRepository.save.mockResolvedValue(savedUser);
      jwtService.sign.mockReturnValue('signed-token');

      const result = await authService.register({
        email: 'test@pedbox.com',
        password: 'password123',
      });

      const createArgs = userRepository.create.mock.calls[0][0] as Partial<User>;
      expect(createArgs.passwordHash).not.toBe('password123');
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException si el email no existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nope@pedbox.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña no coincide', async () => {
      const passwordHash = await bcrypt.hash('correcta123', 10);
      userRepository.findOne.mockResolvedValue({
        id: '1',
        email: 'test@pedbox.com',
        passwordHash,
      } as User);

      await expect(
        authService.login({
          email: 'test@pedbox.com',
          password: 'incorrecta123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devuelve un accessToken cuando las credenciales son correctas', async () => {
      const passwordHash = await bcrypt.hash('correcta123', 10);
      userRepository.findOne.mockResolvedValue({
        id: '1',
        email: 'test@pedbox.com',
        passwordHash,
      } as User);
      jwtService.sign.mockReturnValue('signed-token');

      const result = await authService.login({
        email: 'test@pedbox.com',
        password: 'correcta123',
      });

      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });
});
