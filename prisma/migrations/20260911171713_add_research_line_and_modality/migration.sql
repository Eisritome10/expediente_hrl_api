-- CreateEnum
CREATE TYPE "LineType" AS ENUM ('HRL', 'META_2030');

-- CreateTable
CREATE TABLE "research_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LineType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "research_lines_name_type_key" ON "research_lines"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "modalities_name_key" ON "modalities"("name");
