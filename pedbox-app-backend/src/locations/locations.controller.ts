import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.locationsService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.locationsService.findOne(uuid);
  }
}
