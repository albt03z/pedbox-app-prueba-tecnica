import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { Episode } from '../../episodes/entities/episode.entity';

/**
 * Entidad que representa a un personaje de Rick and Morty (API: /character).
 */
@Entity('characters')
export class Character {
    // Identificador único del personaje.
    @PrimaryColumn({ type: 'int' })
    id!: number;

    // Identificador único universal (UUID) del personaje.
    @Column({ type: 'uuid' })
    uuid!: string;

    // Nombre del personaje.
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    // Estado del personaje (Alive, Dead, unknown).
    @Column({ type: 'varchar', length: 20 })
    status!: string;

    // Tipo de especie del personaje (Human, Alien, etc.).
    @Column({ type: 'varchar', length: 100 })
    species!: string;

    // Subtipo/raza; casi siempre viene vacío en la API de origen.
    @Column({ type: 'varchar', length: 100, nullable: true })
    type!: string;

    // Género del personaje (Female, Male, Genderless, unknown).
    @Column({ type: 'varchar', length: 20 })
    gender!: string;

    // URL de la imagen del personaje.
    @Column({ type: 'varchar', length: 500 })
    image!: string;

    // Relación muchos a uno con la entidad Location para el origen del personaje.
    @ManyToOne(() => Location, (location) => location.charactersOrigin, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'origin_id' })
    origin!: Location | null;

    // Relación muchos a uno con la entidad Location para la ubicación actual del personaje.
    @ManyToOne(() => Location, (location) => location.charactersLocation, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'location_id' })
    location!: Location | null;

    // Relación muchos a muchos con la entidad Episode.
    @ManyToMany(() => Episode, (episode) => episode.characters)
    @JoinTable({
        name: 'character_episode',
        joinColumn: { name: 'character_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'episode_id', referencedColumnName: 'id' },
    })
    episodes!: Episode[];
}