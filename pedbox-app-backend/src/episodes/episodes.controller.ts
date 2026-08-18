import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.episodesService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.episodesService.findOne(uuid);
  }
}
