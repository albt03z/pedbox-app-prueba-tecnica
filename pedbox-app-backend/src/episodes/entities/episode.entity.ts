import { Column, Entity, OneToMany, PrimaryColumn, BeforeInsert } from 'typeorm';
import { Character } from '../../characters/entities/character.entity';
import { randomUUID } from 'crypto';

/**
 * Entidad que representa a un episodio de Rick and Morty (API: /episode).
 */
@Entity('episodes')
export class Episode {
    // Identificador único del episodio.
    @PrimaryColumn({ type: 'int' })
    id!: number;

    // Identificador único universal (UUID) del episodio.
    @Column({ type: 'uuid', unique: true })
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

    /**
     * Antes de insertar un nuevo episodio, genera un UUID si no se ha proporcionado uno.
     * Esto asegura que cada episodio tenga un identificador único universal.
     */
    @BeforeInsert()
    generateUUID() {
        if (!this.uuid) {
            this.uuid = randomUUID();
        }
    }
}