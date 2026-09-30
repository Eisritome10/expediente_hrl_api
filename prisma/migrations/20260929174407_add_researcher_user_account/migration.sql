/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[researcherId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'RESEARCHER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "researcherId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_researcherId_key" ON "users"("researcherId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "researchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
