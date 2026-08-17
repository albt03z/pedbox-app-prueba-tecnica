import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';

/** Expone el repositorio de Episode al resto de la app (seeder, controllers). */
@Module({
  imports: [TypeOrmModule.forFeature([Episode])],
  exports: [TypeOrmModule],
})
export class EpisodesModule {}
