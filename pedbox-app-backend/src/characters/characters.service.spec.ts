import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';

describe('CharactersService', () => {
  let service: CharactersService;
  let repository: jest.Mocked<Repository<Character>>;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CharactersService);
    repository = module.get(getRepositoryToken(Character));
  });

  describe('findAll', () => {
    it('devuelve los personajes paginados con la metadata correcta', async () => {
      const characters = [{ id: 1, name: 'Rick Sanchez' }] as Character[];
      queryBuilder.getManyAndCount.mockResolvedValue([characters, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: characters,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
    });

    it('agrega un filtro ILIKE por nombre cuando se pasa el query param name', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20, name: 'Rick' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'character.name ILIKE :name',
        { name: '%Rick%' },
      );
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe un personaje con ese uuid', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el personaje cuando existe', async () => {
      const character = {
        id: 1,
        uuid: 'abc',
        name: 'Morty Smith',
      } as Character;
      repository.findOne.mockResolvedValue(character);

      const result = await service.findOne('abc');

      expect(result).toEqual(character);
    });
  });
});
