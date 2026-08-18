import { api } from './api';
import type { Character } from '@/types/rick-and-morty.types';
import type { PaginatedResult } from '@/types/pagination.types';

export interface CharacterFilters {
  page?: number;
  limit?: number;
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

/** Arma el query string descartando filtros vacíos/undefined. */
function buildQueryString(filters: CharacterFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const charactersService = {
  findAll: (filters: CharacterFilters) =>
    api.get<PaginatedResult<Character>>(
      `/characters${buildQueryString(filters)}`,
    ),
  findOne: (uuid: string) => api.get<Character>(`/characters/${uuid}`),
};
