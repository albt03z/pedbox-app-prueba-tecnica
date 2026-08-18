import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../locations/entities/location.entity';
import { Episode } from '../episodes/entities/episode.entity';
import { Character } from '../characters/entities/character.entity';
import { RickAndMortyApiService } from './rick-and-morty-api.service';
import {
  RickAndMortyCharacterDto,
  RickAndMortyEpisodeDto,
} from './interfaces/rick-and-morty-api.interfaces';

/**
 * Extrae el id numérico final de una url de la Rick and Morty API,
 * ej: "https://rickandmortyapi.com/api/location/3" -> 3.
 * Devuelve null si la url viene vacía (la API usa "" para "unknown").
 */
function extractIdFromUrl(url: string | null | undefined): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

/**
 * Descompone el campo "episode" de la API (ej: "S01E01") en
 * { season: 1, episode: 1 }. Si el formato no calza, devuelve 0 en ambos
 * para no romper el seed completo por un registro puntual mal formado.
 */
function parseEpisodeCode(code: string): { season: number; episode: number } {
  const match = code.match(/^S(\d{2})E(\d{2})$/i);
  if (!match) return { season: 0, episode: 0 };
  return { season: Number(match[1]), episode: Number(match[2]) };
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly rickAndMortyApi: RickAndMortyApiService,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  /**
   * Orquesta el seed completo. El orden importa por las foreign keys:
   * Location y Episode no dependen de nadie, van primero; Character
   * depende de ambas (origin/location + relación N:M con episodios),
   * va al final.
   */
  async run(): Promise<void> {
    this.logger.log('Iniciando seed desde Rick and Morty API...');
    await this.seedLocations();
    await this.seedEpisodes();
    await this.seedCharacters();
    this.logger.log('Seed completado.');
  }

  private async seedLocations(): Promise<void> {
    const locations = await this.rickAndMortyApi.getAllLocations();
    const entities = locations.map((dto) =>
      this.locationRepository.create({
        id: dto.id,
        name: dto.name,
        type: dto.type,
        dimension: dto.dimension,
      }),
    );
    await this.locationRepository.save(entities);
    this.logger.log(`Locations sembradas: ${entities.length}`);
  }

  private async seedEpisodes(): Promise<void> {
    const episodes = await this.rickAndMortyApi.getAllEpisodes();
    const entities = episodes.map((dto: RickAndMortyEpisodeDto) => {
      const { season, episode } = parseEpisodeCode(dto.episode);
      return this.episodeRepository.create({
        id: dto.id,
        name: dto.name,
        season,
        episode,
        airDate: dto.air_date,
      });
    });
    await this.episodeRepository.save(entities);
    this.logger.log(`Episodes sembrados: ${entities.length}`);
  }

  private async seedCharacters(): Promise<void> {
    const characters = await this.rickAndMortyApi.getAllCharacters();
    for (const dto of characters) {
      await this.seedCharacter(dto);
    }
    this.logger.log(`Characters sembrados: ${characters.length}`);
  }

  /**
   * Inserta un personaje individual. Las relaciones (origin, location,
   * episodes) se asignan como objetos "livianos" con solo el `id` — así
   * TypeORM enlaza las foreign keys / tabla pivote sin cargar las
   * entidades completas desde la base de datos.
   */
  private async seedCharacter(dto: RickAndMortyCharacterDto): Promise<void> {
    const originId = extractIdFromUrl(dto.origin?.url);
    const locationId = extractIdFromUrl(dto.location?.url);
    const episodeIds = dto.episode
      .map((url) => extractIdFromUrl(url))
      .filter((id): id is number => id !== null);

    const character = this.characterRepository.create({
      id: dto.id,
      name: dto.name,
      status: dto.status,
      species: dto.species,
      type: dto.type,
      gender: dto.gender,
      image: dto.image,
      origin: originId ? ({ id: originId } as Location) : null,
      location: locationId ? ({ id: locationId } as Location) : null,
      episodes: episodeIds.map((id) => ({ id }) as Episode),
    });

    await this.characterRepository.save(character);
  }
}
