/** Tipos del dominio, en espejo con las entidades del backend. */

export interface Location {
  id: number;
  uuid: string;
  name: string;
  type: string;
  dimension: string;
}

export interface Episode {
  id: number;
  uuid: string;
  name: string;
  season: number;
  episode: number;
  airDate: string;
}

export interface Character {
  id: number;
  uuid: string;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  origin: Location | null;
  location: Location | null;
  episodes?: Episode[];
}
