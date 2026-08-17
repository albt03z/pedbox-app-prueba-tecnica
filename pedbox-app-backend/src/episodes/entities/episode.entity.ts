import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Character } from '../../characters/entities/character.entity';

/**
 * Entidad que representa a un episodio de Rick and Morty (API: /episode).
 */
@Entity('episodes')
export class Episode {
    // Identificador único del episodio.
    @PrimaryColumn({ type: 'int' })
    id!: number;

    // Identificador único universal (UUID) del episodio.
    @Column({ type: 'uuid' })
    uuid!: string;

    // Nombre del episodio.
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    // Número de temporada al que pertenece el episodio.
    @Column({ type: 'int' })
    season!: number;

    // Número de episodio dentro de la temporada.
    @Column({ type: 'int' })
    episode!: number;

    // Fecha de estreno del episodio.
    @Column({ type: 'date' })
    airDate!: string;

    /**
     * Relación uno a muchos con la entidad Character.
     * Representa los personajes que aparecen en este episodio.
     */
    @OneToMany(() => Character, (character: Character) => character.episodes)
    characters!: Character[];
}