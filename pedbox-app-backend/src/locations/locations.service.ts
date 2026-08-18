import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Location>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.locationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Busca por `uuid` (identificador público), no por el `id` interno. */
  async findOne(uuid: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { uuid },
    });
    if (!location) {
      throw new NotFoundException(`Location con uuid ${uuid} no encontrada`);
    }
    return location;
  }
}
