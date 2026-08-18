import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Episode])],
  controllers: [EpisodesController],
  providers: [EpisodesService],
  exports: [TypeOrmModule],
})
export class EpisodesModule {}
