-- Tipos de institución: reemplaza el booleano "esUniversidad" conservando los datos.
CREATE TYPE "InstitutionType" AS ENUM ('HOSPITAL', 'UNIVERSITY', 'OTHER');

ALTER TABLE "institutions" ADD COLUMN "type" "InstitutionType" NOT NULL DEFAULT 'OTHER';
UPDATE "institutions" SET "type" = 'UNIVERSITY' WHERE "esUniversidad" = true;
ALTER TABLE "institutions" DROP COLUMN "esUniversidad";

-- Las facultades pasan de un catálogo global a pertenecer a una universidad: el nombre ya no es único
-- globalmente, solo dentro de cada universidad.
DROP INDEX "faculties_name_key";

ALTER TABLE "faculties" ADD COLUMN "institutionId" TEXT;

-- Las facultades históricas que solo se usaron con una única institución quedan asociadas a ella.
UPDATE "faculties" f
SET "institutionId" = usage."institucionId"
FROM (
  SELECT "facultadId", MIN("institucionId") AS "institucionId"
  FROM "protocols"
  WHERE "facultadId" IS NOT NULL AND "institucionId" IS NOT NULL
  GROUP BY "facultadId"
  HAVING COUNT(DISTINCT "institucionId") = 1
) usage
WHERE f."id" = usage."facultadId";

CREATE UNIQUE INDEX "faculties_institutionId_name_key" ON "faculties"("institutionId", "name");

ALTER TABLE "faculties"
  ADD CONSTRAINT "faculties_institutionId_fkey"
  FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
