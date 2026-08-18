import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RickAndMortyCharacterDto,
  RickAndMortyEpisodeDto,
  RickAndMortyLocationDto,
  RickAndMortyPaginatedResponse,
} from './interfaces/rick-and-morty-api.interfaces';

/** Pausa entre páginas consecutivas para no saturar la API pública. */
const DELAY_BETWEEN_PAGES_MS = 300;

/** Intentos máximos de reintento ante un 429 antes de darse por vencido. */
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Cliente HTTP para la Rick and Morty API pública. Usa el `fetch` nativo
 * de Node (disponible desde Node 18+) para no sumar dependencias extra
 * (axios/@nestjs/axios) solo por hacer GETs simples.
 *
 * Solo trae datos crudos paginados; la transformación hacia nuestras
 * entidades vive en SeedService, para no mezclar responsabilidades.
 */
@Injectable()
export class RickAndMortyApiService {
  private readonly logger = new Logger(RickAndMortyApiService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('RICK_AND_MORTY_API_URL')!;
  }

  /**
   * Recorre todas las páginas de un endpoint siguiendo el cursor
   * `info.next` que entrega la API, hasta agotarlas, y devuelve todos
   * los resultados concatenados en un solo arreglo.
   *
   * Se agrega una pausa entre páginas porque la API pública responde
   * 429 (Too Many Requests) si se recorren muchas páginas seguidas sin
   * respiro — el endpoint de personajes tiene más de 40 páginas.
   */
  private async fetchAllPages<T>(endpoint: string): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = `${this.baseUrl}/${endpoint}`;

    while (nextUrl) {
      const page = await this.fetchWithRetry<RickAndMortyPaginatedResponse<T>>(
        nextUrl,
      );
      results.push(...page.results);
      nextUrl = page.info.next;

      if (nextUrl) {
        await this.delay(DELAY_BETWEEN_PAGES_MS);
      }
    }

    return results;
  }

  /**
   * Hace un GET con reintento automático ante 429: respeta el header
   * `Retry-After` si la API lo envía, o usa backoff incremental simple
   * en caso contrario. Cualquier otro error HTTP se propaga de inmediato.
   */
  private async fetchWithRetry<T>(url: string, attempt = 1): Promise<T> {
    const response = await fetch(url);

    if (response.status === 429) {
      if (attempt > MAX_RETRY_ATTEMPTS) {
        throw new Error(
          `Rate limit persistente en ${url} tras ${MAX_RETRY_ATTEMPTS} intentos`,
        );
      }
      const retryAfterHeader = response.headers.get('Retry-After');
      const waitMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : attempt * 1000;

      this.logger.warn(
        `429 en ${url} — reintento ${attempt}/${MAX_RETRY_ATTEMPTS} en ${waitMs}ms`,
      );
      await this.delay(waitMs);
      return this.fetchWithRetry<T>(url, attempt + 1);
    }

    if (!response.ok) {
      throw new Error(
        `Error consultando ${url}: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getAllLocations(): Promise<RickAndMortyLocationDto[]> {
    return this.fetchAllPages<RickAndMortyLocationDto>('location');
  }

  getAllEpisodes(): Promise<RickAndMortyEpisodeDto[]> {
    return this.fetchAllPages<RickAndMortyEpisodeDto>('episode');
  }

  getAllCharacters(): Promise<RickAndMortyCharacterDto[]> {
    return this.fetchAllPages<RickAndMortyCharacterDto>('character');
  }
}
