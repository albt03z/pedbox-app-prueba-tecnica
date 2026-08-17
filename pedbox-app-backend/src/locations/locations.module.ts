import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';

/** Expone el repositorio de Location al resto de la app (seeder, controllers). */
@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  exports: [TypeOrmModule],
})
export class LocationsModule {}
