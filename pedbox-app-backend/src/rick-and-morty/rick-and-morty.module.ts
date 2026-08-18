import { Module } from '@nestjs/common';
import { LocationsModule } from '../locations/locations.module';
import { EpisodesModule } from '../episodes/episodes.module';
import { CharactersModule } from '../characters/characters.module';
import { RickAndMortyApiService } from './rick-and-morty-api.service';
import { SeedService } from './seed.service';

/**
 * Agrupa el consumo de la Rick and Morty API: el cliente HTTP y el
 * servicio de seed que normaliza y persiste los datos en las 3 entidades
 * relacionadas.
 */
@Module({
  imports: [LocationsModule, EpisodesModule, CharactersModule],
  providers: [RickAndMortyApiService, SeedService],
  exports: [SeedService],
})
export class RickAndMortyModule {}
