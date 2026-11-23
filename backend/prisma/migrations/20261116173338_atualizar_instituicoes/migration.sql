/*
  Warnings:

  - Added the required column `abrangencia` to the `Instituicao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria` to the `Instituicao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descricao` to the `Instituicao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instituicao" ADD COLUMN     "abrangencia" TEXT NOT NULL,
ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "descricao" TEXT NOT NULL,
ADD COLUMN     "uf" TEXT,
ALTER COLUMN "telefone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "endereco" DROP NOT NULL;
