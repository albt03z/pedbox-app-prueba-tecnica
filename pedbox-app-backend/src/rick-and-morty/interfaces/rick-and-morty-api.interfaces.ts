/**
 * Formas de las respuestas crudas de la Rick and Morty API
 * (https://rickandmortyapi.com/api). Se usan solo durante el consumo/seed;
 * nunca se exponen directamente en nuestra propia API REST.
 */

export interface RickAndMortyPaginationInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface RickAndMortyPaginatedResponse<T> {
  info: RickAndMortyPaginationInfo;
  results: T[];
}

export interface RickAndMortyLocationDto {
  id: number;
  name: string;
  type: string;
  dimension: string;
  url: string;
}

export interface RickAndMortyEpisodeDto {
  id: number;
  name: string;
  air_date: string;
  episode: string; // ej: "S01E01"
  url: string;
}

export interface RickAndMortyCharacterDto {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
}
