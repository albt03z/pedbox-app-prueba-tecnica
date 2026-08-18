# PedBox — Rick and Morty Explorer

Prueba técnica Full Stack para PedBox S.A.S. Aplicación web que consume la [Rick and Morty API](https://rickandmortyapi.com/), normaliza y persiste sus datos en PostgreSQL, los expone mediante una API REST propia (paginada, con filtros, protegida con JWT) y los muestra en un frontend React mobile-first con login/registro, listado y detalle.

## Stack

| Categoría       | Tecnología                                                        |
| --------------- | ------------------------------------------------------------------ |
| Lenguaje        | TypeScript                                                          |
| Backend         | NestJS 11 + TypeORM 1.x                                             |
| Base de datos   | PostgreSQL 17 (Docker)                                              |
| Autenticación   | JWT (Passport) + bcrypt                                             |
| Frontend        | React 19 + TypeScript + Vite + React Router 7                       |
| Estilos         | Tailwind CSS 4 (mobile-first)                                       |

## Arquitectura y modelo de datos

Monorepo con dos proyectos independientes:

```
pedbox-app-prueba-tecnica/
├── docker-compose.yml        # PostgreSQL para desarrollo local
├── pedbox-app-backend/       # API REST (NestJS + TypeORM)
│   └── src/
│       ├── auth/             # Registro, login, JWT strategy/guard
│       ├── users/             # Entidad User (autenticación)
│       ├── locations/         # Entidad Location + endpoints
│       ├── episodes/          # Entidad Episode + endpoints
│       ├── characters/        # Entidad Character + endpoints (recurso principal)
│       ├── rick-and-morty/    # Cliente HTTP + seed de la API externa
│       └── database/          # Script de seed (npm run seed)
└── pedbox-app-frontend/      # SPA (React + Vite + Tailwind)
    └── src/
        ├── context/           # AuthContext (sesión, token, expiración)
        ├── services/          # Cliente HTTP + servicios por recurso
        ├── pages/              # Login, Registro, Listado, Detalle
        ├── routes/             # Rutas públicas/protegidas
        └── components/         # UI reutilizable (Spinner, Dropdown, Pagination...)
```

**Modelo de datos** (normalizado, con relaciones reales — no una tabla plana):

- `Character` **N:1** `Location` — dos veces: `origin` (planeta de origen) y `location` (residencia actual).
- `Character` **N:M** `Episode` — vía tabla pivote `character_episode` (un personaje aparece en varios episodios y viceversa).
- `User` — entidad independiente, solo para autenticación.

Cada entidad expone un `id` interno (igual al id de la API externa, usado para upsert idempotente en el seed) y un `uuid` público, que es el identificador real usado en la API propia y en las URLs del frontend — así no se expone el id secuencial de la API externa.

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 LTS o superior (probado con Node 24)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con WSL2 en Windows) — para levantar PostgreSQL

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd pedbox-app-prueba-tecnica
```

### 2. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Esto crea un contenedor `pedbox-postgres` en el puerto **5433** del host.

### 3. Backend

```bash
cd pedbox-app-backend
npm install
cp .env.example .env   # en Windows: Copy-Item .env.example .env
```

Edita `.env` y reemplaza `JWT_SECRET` por un valor aleatorio propio (puedes generarlo así):

```bash
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

Los demás valores de `.env.example` ya coinciden con `docker-compose.yml` y funcionan tal cual en local.

Puebla la base de datos consumiendo la Rick and Morty API (tarda 1-2 minutos, ~126 locations, ~50+ episodes, ~800+ characters):

```bash
npm run seed
```

Levanta el servidor en modo desarrollo:

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

### 4. Frontend

En otra terminal:

```bash
cd pedbox-app-frontend
npm install
cp .env.example .env   # en Windows: Copy-Item .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno

### Backend (`pedbox-app-backend/.env`)

| Variable                  | Descripción                                         | Ejemplo                              |
| -------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `PORT`                    | Puerto del servidor Nest                              | `3000`                                |
| `NODE_ENV`                | Entorno (`development` desactiva `synchronize` en prod) | `development`                       |
| `DB_HOST`                 | Host de PostgreSQL                                     | `localhost`                          |
| `DB_PORT`                 | Puerto de PostgreSQL (5433, ver docker-compose.yml)     | `5433`                               |
| `DB_USERNAME`             | Usuario de PostgreSQL                                  | `pedbox_user`                        |
| `DB_PASSWORD`             | Contraseña de PostgreSQL                               | —                                     |
| `DB_NAME`                 | Nombre de la base de datos                             | `pedbox_db`                          |
| `JWT_SECRET`               | Secreto para firmar los JWT (usar uno propio y largo)   | —                                     |
| `JWT_EXPIRES_IN`           | Expiración del token                                    | `1d`                                  |
| `RICK_AND_MORTY_API_URL`  | Base URL de la API externa a consumir                  | `https://rickandmortyapi.com/api`    |

### Frontend (`pedbox-app-frontend/.env`)

| Variable         | Descripción                          | Ejemplo                  |
| ----------------- | -------------------------------------- | ------------------------- |
| `VITE_API_URL`    | URL base de la API del backend         | `http://localhost:3000`  |

## API — endpoints principales

Todos los endpoints de recursos (excepto `/auth/*`) requieren header `Authorization: Bearer <token>`.

| Método | Ruta                     | Descripción                                                        |
| ------ | ------------------------- | -------------------------------------------------------------------- |
| POST   | `/auth/register`          | Crea una cuenta y devuelve `{ accessToken }`                        |
| POST   | `/auth/login`              | Inicia sesión y devuelve `{ accessToken }`                          |
| GET    | `/characters`              | Lista paginada (`page`, `limit`) con filtros (`name`, `status`, `species`, `gender`) y orden (`sortBy`, `order`) |
| GET    | `/characters/:uuid`        | Detalle de un personaje (incluye `origin`, `location`, `episodes`)  |
| GET    | `/locations`                | Lista paginada de locations                                          |
| GET    | `/locations/:uuid`          | Detalle de una location                                              |
| GET    | `/episodes`                 | Lista paginada de episodios                                          |
| GET    | `/episodes/:uuid`            | Detalle de un episodio (incluye personajes que aparecen en él)       |

Ejemplo de filtro combinado: `GET /characters?status=Alive&species=Human&sortBy=name&order=ASC&page=1&limit=12`.

### Documentación interactiva (Swagger)

Con el backend corriendo, la documentación OpenAPI está en `http://localhost:3000/api/docs`. Para probar endpoints protegidos: hacé login/register ahí mismo, copiá el `accessToken`, y pegalo en el botón **Authorize** (arriba a la derecha) como `Bearer <token>`.

## Estado de los bonus (opcionales)

| Bonus                                | Estado         |
| -------------------------------------- | -------------- |
| Filtros y búsqueda en el listado       | ✅ Implementado |
| Ordenamiento de resultados             | ✅ Implementado |
| Pruebas unitarias (Jest / RTL)         | ⏳ Pendiente    |
| Documentación con Swagger/OpenAPI      | ✅ Implementado (`/api/docs`) |
| Docker Compose completo (back+front+db) | ⏳ Pendiente (hoy solo la BD está en Docker) |
| Cacheo de resultados                    | ⏳ Pendiente    |
| Logging estructurado                    | ⏳ Pendiente    |
| Despliegue en vivo                      | ⏳ Pendiente    |

## Tests

Aún no se agregaron pruebas automatizadas (bonus pendiente). `npm run test` en el backend corre la suite base generada por Nest CLI.

## Despliegue

Sin desplegar todavía (bonus pendiente).

## Autor

Prueba técnica desarrollada para el proceso de selección de PedBox S.A.S.
