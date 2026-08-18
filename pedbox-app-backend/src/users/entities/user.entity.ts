import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * Usuario de la aplicación (no de la Rick and Morty API). Se usa
 * exclusivamente para autenticación — login/registro con JWT.
 *
 * El id se genera con el mismo patrón que las entidades del dominio
 * (@BeforeInsert + randomUUID) para no depender de extensiones de
 * PostgreSQL como uuid-ossp, que synchronize no habilita solo.
 */
@Entity('users')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  /** Hash bcrypt de la contraseña. Nunca se persiste ni se expone en texto plano. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
