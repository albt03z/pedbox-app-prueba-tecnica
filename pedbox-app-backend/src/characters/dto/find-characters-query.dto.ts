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
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: SortableField = 'name';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}
