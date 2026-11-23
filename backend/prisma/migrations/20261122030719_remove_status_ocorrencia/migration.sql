/*
  Warnings:

  - You are about to drop the column `status` on the `Ocorrencia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ocorrencia" DROP COLUMN "status";

-- DropEnum
DROP TYPE "Status";
