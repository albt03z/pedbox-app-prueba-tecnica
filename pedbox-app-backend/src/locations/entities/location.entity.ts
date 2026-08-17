import { Column, Entity, OneToMany, PrimaryColumn, BeforeInsert } from 'typeorm';
import { Character } from '../../characters/entities/character.entity';
import { randomUUID } from 'crypto';

/**
 * Entidad que representa a un planeta de origen o de residencia 
 * de los personajes (Rick and Morty API: /location).
 */
@Entity('locations')
export class Location {
    // Identificador único del planeta o dimensión.
    @PrimaryColumn({ type: 'int' })
    id!: number;

    // Identificador único universal (UUID) del planeta o dimensión.
    @Column({ type: 'uuid', unique: true })
    uuid!: string;

    // Nombre del planeta o dimensión.
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    // Tipo de lugar (por ejemplo, "Planet", "Dimension", etc.).
    @Column({ type: 'varchar', length: 255 })
    type!: string;

    // Dimensión a la que pertenece el lugar (por ejemplo, "Dimension C-137").
    @Column({ type: 'varchar', length: 255 })
    dimension!: string;

    /**
     * Relación uno a muchos con la entidad Character.
     * Representa los personajes que tienen este lugar como origen.
     */
    @OneToMany(() => Character, (character: Character) => character.origin)
    charactersOrigin!: Character[];

    /**
     * Relación uno a muchos con la entidad Character.
     * Representa los personajes que tienen este lugar como residencia.
     */
    @OneToMany(() => Character, (character: Character) => character.location)
    charactersLocation!: Character[];

    /**
     * Antes de insertar un nuevo personaje, genera un UUID si no se ha proporcionado uno.
     * Esto asegura que cada personaje tenga un identificador único universal.
     */
    @BeforeInsert()
    generateUUID() {
        if (!this.uuid) {
            this.uuid = randomUUID();
        }
    }
}