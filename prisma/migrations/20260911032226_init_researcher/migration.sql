-- CreateTable
CREATE TABLE "researchers" (
    "id" TEXT NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "researchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "researchers_dni_key" ON "researchers"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "researchers_email_key" ON "researchers"("email");
