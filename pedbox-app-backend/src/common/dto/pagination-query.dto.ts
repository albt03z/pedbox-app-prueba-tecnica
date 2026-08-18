import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Query params comunes de paginación para los endpoints de listado.
 * @Type(() => Number) es necesario porque los query params siempre
 * llegan como string ("page=2") — class-transformer los convierte a
 * number antes de que class-validator los valide.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
