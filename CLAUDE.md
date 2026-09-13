## What this project is

`expediente_hrl_api` is a NestJS + Prisma REST API that tracks research protocols for Hospital Regional Lambayeque (HRL). It replaces a legacy procedural-PHP system. Domain entities: `Researcher`, `Institution`, `Faculty`, `Destination`, `ResearchLine`, `Modality`, `User`, `Protocol`, `ProtocolReview` (Spanish equivalents: Investigador, Institución, Facultad, Destino, Línea de Investigación, Modalidad, Usuario, Protocolo, Revisión de Protocolo).

**This file documents the conventions actually implemented in `src/`.** If you're adding or changing a module, match what's already there over anything else — including older design notes (`guia-implementacion-nestjs-prisma-investigahrl.md`, `docs/modelo-datos-nestjs-prisma.md`) that predate the current code and use different folder/class names (`use-cases/`, `dto/`, `errors/`, Spanish class names). Those docs are historical context only; do not follow their naming when they conflict with this file or with existing code under `src/modules/`.

## Architecture: feature-based / vertical-slice (not hexagonal)

Full hexagonal (domain/application/infrastructure with repository ports and adapters) is intentionally skipped: Prisma will never be swapped out as the ORM, so an `abstract class XRepositoryPort` plus its Prisma adapter is indirection with no payoff. Every feature injects `PrismaService` directly and uses the types Prisma generates (`import { Researcher } from '@prisma/client'`) instead of hand-maintained domain interfaces.

What's kept, because it pays for itself:

- **One class per use case, called a "feature"** (`CreateResearcherFeature`, `ListResearchersFeature`, ...), each with a single `execute(...)` method — single responsibility, easy to locate and unit test.
- **`common/exceptions/domain.exception.ts`** — abstract base class for every business error, carrying a `DomainErrorCode` (see `common/enums/domain-error-code.enum.ts`), caught by `common/filters/domain-exception.filter.ts` and mapped centrally to an HTTP response so features never need their own `try/catch` for business rules.
- **`common/filters/prisma-exception.filter.ts`** — safety net for Prisma errors not explicitly translated into a domain exception (e.g. unhandled unique-constraint violations).
- **Separate request/response DTOs** — the response DTO is never the raw Prisma type; it exposes a `static from(prismaModel)` factory, so the DB schema is never leaked straight to the HTTP client.
- For the module with real business rules (`Protocol`), conditional logic is isolated in a pure module (`protocolo.rules.ts`) called from the feature — the rule is protected without standing up ports/adapters.
- **English identifiers everywhere in code** (classes, methods, files, DB schema). Spanish is used only in user-facing strings: Swagger `@ApiOperation summary`, validation/error messages, and comments that explain a domain rule.

## Shared pieces (once per project)

```
src/
  common/
    config/app-config/        # ConfigModule wiring + joi validation schema
    decorators/                # e.g. @UpperCase() transform decorator
    dtos/
      request/paginate-query.request.dto.ts
      response/paginated-result.response.dto.ts
    enums/domain-error-code.enum.ts
    exceptions/domain.exception.ts
    filters/
      domain-exception.filter.ts
      prisma-exception.filter.ts
    interfaces/auth-current-user.interface.ts
    swagger/api-paginated-response.decorator.ts
    utils/
      pagination.util.ts
      prisma-error.util.ts
  prisma/
    prisma.service.ts
    prisma.module.ts
  seeder/                      # creates the initial ADMIN user on boot
  main.ts
  app.module.ts
```

`PrismaModule` is `@Global()`; `PrismaService` extends `PrismaClient` (via the `@prisma/adapter-pg` driver adapter) and connects/disconnects on module init/destroy. `main.ts` sets the global prefix `api/v1`, wires CORS from `CORS_ORIGIN`, a global `ValidationPipe({ whitelist: true, transform: true })`, the global exception filters, and mounts Swagger at `/api/docs`.

## Module template — applies to every entity

```
src/modules/<entity>/
  dtos/
    request/
      create-<entity>.request.dto.ts
      update-<entity>.request.dto.ts
      list-<entity>.query.dto.ts        (when the list endpoint takes filters/pagination)
    response/
      <entity>.response.dto.ts
  exceptions/
    <entity>-not-found.exception.ts
    <entity>-<field>-already-exists.exception.ts   (one per unique field, not one generic "duplicate")
  features/
    create-<entity>.feature.ts
    list-<entity>.feature.ts            (or find-<entity>-by-<field>.feature.ts for a filtered lookup)
    find-<entity>-by-id.feature.ts
    update-<entity>.feature.ts
    delete-<entity>.feature.ts
    test/
      <same-name>.feature.spec.ts       # one spec per feature, colocated
  <entity>.controller.ts
  <entity>.module.ts
```

Entity/module folder names, class names, method names, and file names are always **English**, singular (`researcher/`, not `researchers/` or `investigador/`).

| Piece | Responsibility | Depends on |
|---|---|---|
| `dtos/request/*` | Validate/transform input shape (`class-validator`/`class-transformer`) | Nothing from the domain |
| `dtos/response/*` | Explicit output shape, with `static from(prismaModel)` | Prisma type (mapping only) |
| `exceptions/*` | Business failures, extend `DomainException`, own `DomainErrorCode` | `common/exceptions/domain.exception.ts` |
| `features/*` | One class, one `execute(...)` method; orchestrates the rule, talks to `PrismaService` | Prisma, request DTOs, exceptions |
| `*.controller.ts` | Translate HTTP ↔ features; owns `@ApiTags`/`@ApiOperation`/`@UseAuth(...)` | Features, both DTO sides |
| `*.module.ts` | Wire everything with Nest DI (imports `PrismaModule` + `AuthModule`, declares controller + all features as providers) | Everything above |

## Prisma schema composition

Prisma **model and field names are always English**, matching the implemented `Researcher`, `Institution`, `Faculty`, `Destination`, `ResearchLine`, `Modality`, `User`, `Protocol` models in `prisma/schema.prisma`. Every new model must follow the same convention:

- Primary key: `id String @id @default(uuid())` — never an `Int @default(autoincrement())` id.
- Always include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Always add `@@map("<snake_case_plural>")` so the DB table name is explicit and decoupled from the PascalCase model name.
- Unique/natural-key fields (`name`, `username`, `dni`, `description`) get `@unique` at the field level, or `@@unique([...])` at the model level for composite keys — this is exactly what each entity's "already exists" exception checks against (see `getUniqueConstraintTarget` in `common/utils/prisma-error.util.ts`).
- Declare the inverse relation array (e.g. `protocols Protocol[]`) on every catalog entity referenced by `Protocol`, so the relation compiles both ways. N:N relations that carry their own data (coinvestigadores, asesores, destinos) go through an explicit join model (`ProtocolCoinvestigador`, `ProtocolAsesor`, `ProtocolDestino`), not an implicit Prisma many-to-many.
- After any schema change: run `yarn prisma:dev:migrate` (wraps `prisma migrate dev`) to create the migration and regenerate the client before wiring a module's features to it.

## Per-entity notes

- **Researcher** — reference module, full CRUD, `ADMIN`-protected. Duplicate checks on both `dni` and `email`.
- **Institution**, **Faculty**, **Destination**, **Modality** — simple CRUD, same template as `Researcher`, unique-name validation only (`Modality.fee` is not part of its uniqueness rule).
- **ResearchLine** — read-only on purpose (no create/edit screen exists in the legacy system; rows are inserted directly in the DB): only `ListResearchLinesFeature` (filterable by `type`) and `FindResearchLineByIdFeature`, `GET`-only controller. Add create/update/delete later only if the business asks for it.
- **User** — model and seeder exist (`src/seeder/`, driven by `SEED_ADMIN_PASSWORD`); a full CRUD module is not implemented yet.
- **Auth** — separate module (`src/modules/auth/`): `LoginFeature` and `RefreshTokenFeature`, Passport JWT strategies (`jwt-access`, `jwt-refresh`), `JwtAccessGuard`/`JwtRefreshGuard`/`RolesGuard`, and the `@UseAuth(...roles)` decorator that every other write controller uses. Passwords are hashed with `argon2`, never compared with `==`.
- **Protocol** — core of the domain, highest complexity. `protocolo.rules.ts` holds the pure conditional-validation logic (convenio/enmienda/revisión HC rules), called from `CreateProtocolFeature`. N:N relations (coinvestigadores, asesores, destinos) arrive in the request DTO as id arrays and are written through the explicit join models via Prisma's `connect`/nested create.
- **ProtocolReview** — not implemented yet; when added, follow the `Protocol` pattern (1:N history, never mutate a past revision, `usuarioRevisorId`/reviewer id comes from `req.user` via the auth guard, never a free-text field).

## How to apply a change without breaking structure or conventions

Before writing code, locate the closest existing analog (usually `researcher/` for simple CRUD, `protocol/` for anything with business rules or N:N relations) and mirror it file-for-file. Concretely:

1. **New CRUD entity** — copy the module template above under `src/modules/<entity>/`, using the exact folder names (`dtos/`, `exceptions/`, `features/`) and file suffixes (`.request.dto.ts`, `.response.dto.ts`, `.exception.ts`, `.feature.ts`) already in use. Do not introduce alternate names like `dto/`, `errors/`, or `use-cases/` even if an older doc suggests them.
2. **New field on an existing entity** — update the Prisma model (English name, migrate with `yarn prisma:dev:migrate`), then the request DTO(s), the response DTO's constructor + `from()`, and any feature that maps input to a Prisma `data` object. Don't add a field to the response DTO without adding it to `from()`.
3. **New business rule** — if it's a single condition, inline it in the feature; if it's several related conditions on one entity (like `Protocol`), add a pure function/class named `<entity>.rules.ts` next to the module and call it from the feature, instead of branching directly inside the feature or the controller.
4. **New failure case** — add one exception class per case under `exceptions/`, extending `DomainException`, with its own entry in `DomainErrorCode`. Never throw a generic `Error` or reuse an unrelated exception for a new failure mode.
5. **New endpoint** — add it to the existing `*.controller.ts` for that entity; don't create a second controller for the same entity. Reuse `@UseAuth(UserRole.X)`, `@ApiTags`, and the existing Swagger decorator style already used by sibling endpoints.
6. **Wiring** — register new features/controllers in the entity's `*.module.ts` only; don't add cross-entity providers to `AppModule` unless the piece is truly shared (in which case it belongs under `common/`, not a feature module).
7. **Tests** — add a `<feature-name>.feature.spec.ts` under `features/test/` colocated with the feature, following the mocking style already used by sibling specs (mock `PrismaService`, assert on the exception thrown for each failure branch).
8. **Naming sanity check before committing**: everything under `src/` — folders, classes, files, Prisma models/fields — must read in English; only Swagger summaries, validation messages, and comments explaining a domain rule may be in Spanish. If a new name doesn't have an obvious English equivalent already used elsewhere in the codebase, check `prisma/schema.prisma` and the closest sibling module before inventing one.

## Suggested build order for what's still missing

1. `User` CRUD module (model + login already exist).
2. `ProtocolReview` — depends on `Protocol` and `auth` (reviewer user comes from the authenticated session).
