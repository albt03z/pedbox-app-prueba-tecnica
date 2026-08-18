import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './entities/episode.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Episode>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Orden cronológico (temporada, luego episodio) en vez de alfabético.
    const [data, total] = await this.episodeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { season: 'ASC', episode: 'ASC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Busca por `uuid` (identificador público), no por el `id` interno. */
  async findOne(uuid: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { uuid },
      relations: { characters: true },
    });
    if (!episode) {
      throw new NotFoundException(`Episode con uuid ${uuid} no encontrado`);
    }
    return episode;
  }
}
