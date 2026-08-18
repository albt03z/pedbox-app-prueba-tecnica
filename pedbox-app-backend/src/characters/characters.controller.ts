import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CharactersService } from './characters.service';
import { FindCharactersQueryDto } from './dto/find-characters-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Endpoints del recurso principal. Protegidos con JwtAuthGuard: solo
 * usuarios autenticados (con un JWT válido de /auth/login) pueden listar
 * o ver detalle de personajes.
 */
@ApiTags('characters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  findAll(@Query() query: FindCharactersQueryDto) {
    return this.charactersService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.charactersService.findOne(uuid);
  }
}
