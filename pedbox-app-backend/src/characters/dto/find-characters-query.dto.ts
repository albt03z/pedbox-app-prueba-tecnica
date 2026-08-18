import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Whitelist de campos ordenables. Se valida con @IsIn en vez de aceptar
 * cualquier string, porque este valor se interpola directamente en la
 * cláusula ORDER BY (nombre de columna) — sin whitelist sería una
 * inyección SQL vía nombre de columna.
 */
const SORTABLE_FIELDS = ['name', 'status', 'species', 'gender'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

/** Query params del listado de personajes: paginación + filtros + orden. */
export class FindCharactersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Rick' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Alive' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Human' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'name' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: SortableField = 'name';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}
