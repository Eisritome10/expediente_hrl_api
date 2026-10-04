## What this project is

`expediente_hrl_api` is a NestJS + Prisma REST API that tracks research protocols for Hospital Regional de Loreto (HRL). It replaces a legacy procedural-PHP system. Domain entities: `Researcher`, `Institution`, `Faculty`, `Destination`, `ResearchLine`, `Modality`, `StudyDesign`, `User`, `Protocol`, `ProtocolReview` (Spanish equivalents: Investigador, Institución, Facultad, Destino, Línea de Investigación, Modalidad, Diseño de Estudio, Usuario, Protocolo, Revisión de Protocolo).

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
  seeder/                      # creates the initial ADMIN user (ADMIN / admin@admin.com) on boot
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

Prisma **model and field names are always English**, matching the implemented `Researcher`, `Institution`, `Faculty`, `Destination`, `ResearchLine`, `Modality`, `StudyDesign`, `User`, `Protocol` models in `prisma/schema.prisma`. Every new model must follow the same convention:

- Primary key: `id String @id @default(uuid())` — never an `Int @default(autoincrement())` id.
- Always include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Always add `@@map("<snake_case_plural>")` so the DB table name is explicit and decoupled from the PascalCase model name.
- Unique/natural-key fields (`name`, `username`, `dni`, `description`) get `@unique` at the field level, or `@@unique([...])` at the model level for composite keys — this is exactly what each entity's "already exists" exception checks against (see `getUniqueConstraintTarget` in `common/utils/prisma-error.util.ts`).
- Declare the inverse relation array (e.g. `protocols Protocol[]`) on every catalog entity referenced by `Protocol`, so the relation compiles both ways. N:N relations that carry their own data (coinvestigadores, asesores, destinos, disenosEstudio) go through an explicit join model (`ProtocolCoinvestigador`, `ProtocolAsesor`, `ProtocolDestino`, `ProtocolStudyDesign`), not an implicit Prisma many-to-many.
- After any schema change: run `yarn prisma:dev:migrate` (wraps `prisma migrate dev`) to create the migration and regenerate the client before wiring a module's features to it.

## Per-entity notes

- **Researcher** — reference module, full CRUD, `ADMIN`-protected. Duplicate checks on both `dni` and `email`. `CreateResearcherFeature` also creates the researcher's login account in the same nested write: a `User` with `role: RESEARCHER`, `username = dni`, `email = researcher email`, initial password = `dni` (argon2-hashed), linked through `User.researcherId` (unique, `onDelete: Cascade`). P2002 is mapped to the researcher *and* user duplicate exceptions. A user linked to a researcher can't change role (`UserManagedByResearcherException`). No separate roles table: roles are the `UserRole` enum, compared directly by `RolesGuard`.
- **Institution** has a `type` (`InstitutionType`: `HOSPITAL`/`UNIVERSITY`/`OTHER`, required on create; it replaced the old `esUniversidad` boolean). Only a `UNIVERSITY` has faculties, and a university with faculties can't change type (`InstitutionHasFacultiesException`, 409). **Faculty** belongs to a university (`Faculty.institutionId`, `onDelete: Cascade`, unique per `[institutionId, name]` so two universities can both have a "Medicina"): create takes `institutionId` (must be a `UNIVERSITY`, else `FacultyInstitutionNotUniversityException` 400), the university of a faculty never changes (update only renames), and `GET /faculties?institutionId=` lists one university's faculties. Historical faculties from the old global catalog may have `institutionId = null` (the migration backfills it when a faculty was only ever used with one institution); a protocol's `facultadId` must belong to its `institucionId` (`ProtocoloFacultadNoPerteneceInstitucionException`) unless the faculty is historical.
- **Faculty** is covered above; **Destination**, **Modality**, **StudyDesign**, **Agreement** — simple CRUD, same template as `Researcher`, unique-name validation only (`Modality.fee` is not part of its uniqueness rule). `StudyDesign` ("diseños de estudio") is a plain catalog kept editable via CRUD (not hardcoded/read-only) because the business asked to be able to add/rename entries without a deploy; it's referenced by `Protocol` as an N:N (see below), the same way `Destination` is. `Agreement` ("convenio") is referenced by `Protocol` as an optional 1:N FK (`Protocol.convenioId`), not a join model; its relation uses `onDelete: Restrict` and `DeleteAgreementFeature` maps the resulting P2003 to `AgreementInUseByProtocolException` (409) — the same pattern used for `ResearchLine`.
- **ResearchLine** — full CRUD (business asked for a create/edit screen instead of DB-only rows, see PR #25), same template as `Researcher`: `CreateResearchLineFeature`, `ListResearchLinesFeature` (filterable by `type`), `FindResearchLineByIdFeature`, `UpdateResearchLineFeature`, `DeleteResearchLineFeature`, unique-name validation, write endpoints `ADMIN`-protected.
- **User** — full CRUD, `ADMIN`-protected, same template as `Researcher`. `username` is immutable on update (like `Researcher.dni`); password changes are out of scope for the update endpoint (no password field on `PATCH`). Passwords are hashed with `argon2` in `CreateUserFeature`; `UserResponseDto` never exposes `passwordHash`. Seeder (`src/seeder/`, driven by `SEED_ADMIN_PASSWORD`, default `ADMIN`) owns the initial admin user (`username: ADMIN`, `email: admin@admin.com`) and renames a legacy `admin` to `ADMIN` without touching its password.
- **Auth** — separate module (`src/modules/auth/`): `LoginFeature` and `RefreshTokenFeature`, Passport JWT strategies (`jwt-access`, `jwt-refresh`), `JwtAccessGuard`/`JwtRefreshGuard`/`RolesGuard`, and the `@UseAuth(...roles)` decorator that every other write controller uses. Login takes a single `identifier` field (username or email, resolved with one `findFirst` + `OR` query, never two lookups). Passwords are hashed with `argon2`, never compared with `==`.
- **Protocol** — core of the domain, highest complexity. `protocolo.rules.ts` holds the pure conditional-validation logic (exoneración del pago por convenio/enmienda, revisión HC completa, constancia ética completa, certificado de buenas prácticas solo con HC, roles duplicados, lugar de ejecución y memos), called from both `CreateProtocolFeature` and `UpdateProtocolFeature`. Reference validation (existence + duplicate checks on every FK and id array, plus `protocoloOriginalId`, which must exist and be `FINALIZED` or `ProtocolOriginalNotAmendableException` 409) lives in `protocol.references.ts` (`validateProtocolReferences`), shared by both features instead of duplicated. N:N relations (coinvestigadores, asesores, destinos, disenosEstudio/`studyDesignIds`) arrive in the request DTO as id arrays and are written through the explicit join models via Prisma's `connect`/nested create; each array is validated for existence and duplicates before the `create`/`update` call. **Everything documental is captured when the protocol is created**: the review payment (`pagoRevision`, `tipoComprobante`, `comprobanteRevision`; forced to 0 with no receipt when the protocol has a convenio or is an amendment), the ethics documentation (`tieneConstanciaEtica` + `idConstanciaEtica` + `fechaConstancia`, `consentimientoInformado`, `departamentoDirigidoPermiso`) and `certificadoBuenasPracticas` (only stored when `requiereRevisionHc`). `propositoRevision`/`fechaRevision` are no longer asked for (legacy columns, `propositoRevision` is nullable). **Amendment**: `protocoloOriginalId` (self FK, `onDelete: Restrict`) is sent on create and `esEnmienda` is derived from it; an old `esEnmienda = true` row without original stays exonerated; neither changes by PATCH. `Protocol.status` (`ProtocolStatus`: `CREATED`/`CIC_OBSERVED`/`CIC_CORRECTED`/`CIEI_OBSERVED`/`CIEI_CORRECTED`/`FINALIZED`) is a denormalized "current state" field driven by `ProtocolReview` — never set directly by a client; it encodes both *which* committee (CIC then CIEI, always in that order) and whether the last observation from that committee was already corrected. The only field a review writes onto `Protocol` is `catalogadoRiesgo` (`RiskLevel`, set by the CIEI). `Protocol` is otherwise create+read only: the one exception is `PATCH /protocols/:id`, which accepts an optional `correctionComment` stored as an immutable `ProtocolCorrection` row (shown in the history of both the admin and the researcher; useful when the fix was made outside the system) and only succeeds while `status` is `CIC_OBSERVED` or `CIEI_OBSERVED`, re-runs `applyProtocoloRules` + `validateProtocolReferences` over the merged (current + patch) state, may correct the payment and the documentation (an explicit `null` clears payment, receipt and department), never writes `catalogadoRiesgo`, `propositoRevision`, `fechaRevision`, `esEnmienda` or `protocoloOriginalId`, and always leaves the protocol in the matching `*_CORRECTED` state — it can never set an `*_OBSERVED` state or `FINALIZED` itself. Lifting an exoneration by PATCH does not keep its fake 0 payment (it becomes unregistered until corrected).
- **Researcher-facing endpoints** — `GET /protocols/mine` and `GET /protocols/mine/:id` (`@UseAuth(UserRole.RESEARCHER)` on the method, overriding the class-level `ADMIN`; `RolesGuard` uses `getAllAndOverride`) are the only endpoints a `RESEARCHER` can call. Both are declared before `GET :id` so `mine` isn't parsed as an id. `ListResearcherProtocolsFeature` resolves `User.researcherId` (throws `ResearcherAccountNotLinkedException`, 403, if null) and lists protocols where the researcher is principal, coinvestigador or asesor (`researcherParticipationWhere`, shared), returning the slim `ProtocolSummaryResponseDto` (including `status`). `FindResearcherProtocolByIdFeature` applies the same participation filter: a protocol that doesn't belong to the researcher answers 404 `ProtocolNotFoundException` (it doesn't reveal that it exists). Its `ResearcherProtocolDetailResponseDto` exposes status, amendment (`esEnmienda` + original expediente) and the reviews with committee, outcome, date and typed observations — never the reviewer nor any amount. Any new endpoint is `ADMIN`-only unless it explicitly opts a role in.
- **ProtocolReview** — 1:N immutable history of `Protocol` in its own module (`src/modules/protocol-review/`), mounted at `protocols/:protocolId/reviews`. Each review carries a `committee` (`Committee`: `CIC`/`CIEI`) and an `outcome` (`ReviewOutcome`: `OBSERVED`/`APPROVED`/`FINALIZED`) instead of reusing `ProtocolStatus` — CIC only ever produces `OBSERVED`/`APPROVED`, CIEI only ever produces `OBSERVED`/`FINALIZED`. A review only evaluates and writes observations: **a review has a list of observations**, each a `ProtocolReviewObservation` row (`observationItems`) with an `ObservationType` (`INFORMED_CONSENT`, `ETHICS_CONSTANCE`, `ADMINISTRATIVE`, `METHODOLOGICAL`, `LEGAL_INSTITUTIONAL`, `OTHER`) and a text; `OBSERVED` requires at least one and none may be blank. The legacy free-text column `ProtocolReview.observations` is no longer written; `ProtocolReviewObservationResponseDto.listFrom` exposes an old review's text as one item with `type: null`. The only thing a CIEI review writes onto `Protocol` is `catalogadoRiesgo` (a CIC review sending it is rejected). The full state machine (which `(committee, outcome)` pairs are legal from which `Protocol.status`, and the resulting next status) is pure logic in `protocol-review.rules.ts` (`assertReviewRequest`, `resolveNextProtocolStatus`, `assertCieiFinalizationRequirements`, `resolveEthicsUpdate`), not inlined in the feature: CIEI is only reachable after the *last* CIC review was `APPROVED` (checked via `protocolReview.findFirst` ordered by `createdAt`), a committee stops accepting new reviews once it closed (CIC approved, or the protocol already moved into a CIEI status), and `FINALIZED` is only reachable from CIEI, which only requires the risk level in the request: the documentation registered at creation (constancia ética, consentimiento informado, certificado de buenas prácticas) is evaluated by the CIEI but a missing document never blocks finalizing. `CreateProtocolReviewFeature` takes `reviewerId` from `req.user` via `@CurrentUser()` (never a free-text field), re-validates the reviewer is an `ACTIVE` `User`, and — inside a single `$transaction` — does a conditional `updateMany` locked on both `status` *and* `updatedAt` (an `APPROVED` outcome doesn't change `status`, so `updatedAt` is needed to detect a concurrent write; a concurrent PATCH also changes it) before inserting the review row and its observation items; `count === 0` throws `ProtocolReviewConcurrentUpdateException`. Past reviews are never mutated or deleted — no update/delete feature exists for this entity. `ProtocolReview.reviewerId`/`protocolId` and `ProtocolReviewObservation.reviewId` use `onDelete: Restrict`.

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

## AI development pipeline

For a full requirement (not a one-line change or exploration), use the `dev-pipeline` skill (`.claude/skills/dev-pipeline/SKILL.md`): it runs researcher → planner → implementer → validation (`yarn lint`/`test`/`build`) → reviewer → fixer, stopping to ask for a human decision on ambiguity, architecture changes, or after 2 failed review iterations. The five roles are defined in `.claude/agents/`.

If the work item lives in Taiga instead of being described inline, use the `taiga-pipeline` skill (`.claude/skills/taiga-pipeline/SKILL.md`) instead: it pulls the story/task/issue with the `taiga` skill, gathers codebase context with `researcher`, persists both under `.claude/tasks/` (mirrored to Obsidian if configured), and then hands off to `dev-pipeline` from the planning step onward. Requires `USERNAME_TAIGA`/`PASSWORD_TAIGA`/`TAIGA_URL` in `.env` (not yet present in this project — see report).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
