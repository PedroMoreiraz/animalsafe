-- CreateTable
CREATE TABLE "GuiaOrientacao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    "grupo_animal" TEXT NOT NULL,
    "nivel_risco" TEXT NOT NULL,
    "o_que_fazer" TEXT[],
    "o_que_evitar" TEXT[],
    "quando_pedir_ajuda" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "url_fonte" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuiaOrientacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuiaOrientacao_situacao_grupo_animal_idx" ON "GuiaOrientacao"("situacao", "grupo_animal");

-- CreateIndex
CREATE INDEX "GuiaOrientacao_ativo_idx" ON "GuiaOrientacao"("ativo");
