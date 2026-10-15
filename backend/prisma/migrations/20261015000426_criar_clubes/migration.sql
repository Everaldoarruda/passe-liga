-- CreateTable
CREATE TABLE "clubes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "sigla" CHAR(3) NOT NULL,
    "caixa" DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    "formacao" VARCHAR(5),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubes_sigla_key" ON "clubes"("sigla");
