import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';

/** Expone el repositorio de Character al resto de la app (seeder, controllers). */
@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  exports: [TypeOrmModule],
})
export class CharactersModule {}
