import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { FindCharactersQueryDto } from './dto/find-characters-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  /**
   * Lista personajes con paginación, filtros opcionales (name/status/
   * species/gender, todos parciales e insensibles a mayúsculas vía
   * ILIKE) y ordenamiento por un campo de la whitelist.
   */
  async findAll(
    query: FindCharactersQueryDto,
  ): Promise<PaginatedResult<Character>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const order = query.order ?? 'ASC';

    const qb = this.characterRepository
      .createQueryBuilder('character')
      .leftJoinAndSelect('character.origin', 'origin')
      .leftJoinAndSelect('character.location', 'location');

    if (query.name) {
      qb.andWhere('character.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.status) {
      qb.andWhere('character.status ILIKE :status', {
        status: query.status,
      });
    }
    if (query.species) {
      qb.andWhere('character.species ILIKE :species', {
        species: query.species,
      });
    }
    if (query.gender) {
      qb.andWhere('character.gender ILIKE :gender', {
        gender: query.gender,
      });
    }

    qb.orderBy(`character.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Busca por `uuid` (identificador público), no por el `id` interno. */
  async findOne(uuid: string): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { uuid },
      relations: { origin: true, location: true, episodes: true },
    });
    if (!character) {
      throw new NotFoundException(`Personaje con uuid ${uuid} no encontrado`);
    }
    return character;
  }
}
