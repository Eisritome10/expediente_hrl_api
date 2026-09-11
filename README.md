<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">API REST para el seguimiento de protocolos de investigación del Hospital Regional Lambayeque (HRL), construida con NestJS y Prisma.</p>

## Descripción

`expediente_hrl_api` es la migración del sistema de seguimiento de protocolos de investigación del HRL (originalmente en PHP procedural) a una API REST en NestJS + Prisma. El proyecto sigue una arquitectura **feature-based / vertical-slice**: cada entidad de dominio vive en su propio módulo bajo `src/modules/<entidad>/`, con un caso de uso (`*.feature.ts`) por operación, en vez de capas hexagonales completas — ver [CLAUDE.md](CLAUDE.md) para el detalle de las convenciones de arquitectura y nomenclatura seguidas en todo el código.

## Stack técnico

- **Framework:** [NestJS](https://nestjs.com/) 12 (plataforma Express)
- **Base de datos:** PostgreSQL, vía [Prisma ORM](https://www.prisma.io/) 7 con el driver adapter `@prisma/adapter-pg` (sin engine binario, conexión por `pg.Pool`)
- **Autenticación:** JWT (access + refresh) con `@nestjs/passport` + `passport-jwt`, hash de contraseñas con `argon2`
- **Validación:** `class-validator` / `class-transformer`, configuración validada con `joi`
- **Testing:** Jest (unitario) + Supertest (e2e)
- **Lint:** `oxlint`

## Estado actual del proyecto

### Entidades implementadas

| Entidad | Ruta base | Operaciones | Protección |
|---|---|---|---|
| `Researcher` (Investigador) | `/researchers` | CRUD completo | `ADMIN` |
| `Institution` (Institución) | `/institutions` | CRUD completo | `ADMIN` |
| `Faculty` (Facultad) | `/faculties` | CRUD completo | `ADMIN` |
| `Destination` (Destino) | `/destinations` | CRUD completo | `ADMIN` |
| `Modality` (Modalidad) | `/modalities` | CRUD completo | `ADMIN` |
| `ResearchLine` (Línea de Investigación) | `/research-lines` | Solo lectura (`GET`, filtrable por `type`) | `ADMIN` |
| `User` (Usuario) | — | Sin CRUD propio todavía; existe el modelo y un seeder de usuario admin inicial | — |
| `Auth` | `/auth/login`, `/auth/refresh` | Login y refresco de tokens | Pública (login) / Bearer refresh token (`/refresh`) |

Todas las rutas de catálogo (`researchers`, `institutions`, `faculties`, `destinations`, `modalities`, `research-lines`) requieren un access token JWT válido y el rol `ADMIN`, vía el decorador compuesto `@UseAuth(UserRole.ADMIN)`.

### Pendiente (según la guía de migración, ver `guia-implementacion-nestjs-prisma-investigahrl.md`)

- CRUD de `User` (el modelo y el login ya existen; falta el módulo de gestión de usuarios)
- `Protocolo` — núcleo del dominio, con reglas de negocio condicionales y relaciones N:N
- `RevisionProtocolo` — historial de revisiones sobre `Protocolo`

## Arquitectura

Cada módulo de entidad sigue esta estructura:

```
src/modules/<entidad>/
  dtos/
    request/    # DTOs de entrada, validados con class-validator
    response/   # DTOs de salida, nunca el tipo crudo de Prisma
  exceptions/   # Errores de dominio (extienden DomainException)
  features/     # Un caso de uso por archivo (create/list/find/update/delete), método execute()
    test/       # Specs unitarios, uno por feature
  <entidad>.controller.ts
  <entidad>.module.ts
```

Piezas compartidas relevantes:

- `src/common/exceptions/domain.exception.ts` + `src/common/enums/domain-error-code.enum.ts` + `src/common/filters/domain-exception.filter.ts` — errores de dominio con código propio, mapeados centralmente a status HTTP.
- `src/common/filters/prisma-exception.filter.ts` — red de seguridad para errores de Prisma no traducidos explícitamente a una excepción de dominio.
- `src/common/utils/pagination.util.ts` / `prisma-error.util.ts` — paginación y detección de violación de constraint único, reutilizados por todos los módulos.
- `src/modules/auth/` — estrategias Passport (`jwt-access`/`jwt-refresh`), guards (`JwtAccessGuard`, `JwtRefreshGuard`, `RolesGuard`) y el decorador `@UseAuth(...roles)` que protege el resto de los controladores.
- `src/prisma/` — `PrismaService` (driver adapter `pg`) y `PrismaModule` (`@Global()`).
- `src/seeder/` — crea un usuario `ADMIN` inicial al arrancar la app, a partir de `SEED_ADMIN_PASSWORD`.

Ver [CLAUDE.md](CLAUDE.md) para las convenciones completas (nomenclatura, plantilla de módulo, composición del schema de Prisma) que debe seguir cualquier módulo nuevo.

## Configuración del entorno

```bash
$ cp .env.example .env.development
```

Variables requeridas (ver `.env.example`):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor HTTP (default `3000`) |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos de firma JWT, mínimo 32 caracteres cada uno, deben ser distintos entre sí |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Expiración de tokens (ej. `15m`, `7d`) |
| `SEED_ADMIN_PASSWORD` | Contraseña del usuario `admin` que crea el seeder en el primer arranque |

## Instalación

```bash
$ yarn install
```

## Base de datos

```bash
# aplicar migraciones pendientes en desarrollo
$ yarn prisma:dev:migrate

# explorar la base de datos con Prisma Studio
$ yarn prisma:dev:studio
```

## Ejecutar el proyecto

```bash
# desarrollo (watch mode)
$ yarn start:dev

# producción
$ yarn build
$ yarn start:prod
```

Al arrancar, el `SeederService` crea automáticamente un usuario `admin` (rol `ADMIN`) si no existe, usando `SEED_ADMIN_PASSWORD`. Con ese usuario se obtiene el primer access token vía `POST /auth/login`.

## Tests

```bash
# unitarios
$ yarn test

# unitarios con cobertura
$ yarn test:cov

# e2e
$ yarn test:e2e

# lint
$ yarn lint
```

## Licencia

`UNLICENSED` — proyecto privado.
