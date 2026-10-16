-- CreateTable
CREATE TABLE "contratos" (
    "id" SERIAL NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "valor_compra" DECIMAL(6,2) NOT NULL,
    "fidelidade_ate" TIMESTAMP(3) NOT NULL,
    "situacao" VARCHAR(12) NOT NULL,
    "iniciado_em" TIMESTAMP(3) NOT NULL,
    "encerrado_em" TIMESTAMP(3),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" SERIAL NOT NULL,
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "nome_jogador" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(6) NOT NULL,
    "valor" DECIMAL(6,2) NOT NULL,
    "taxa" DECIMAL(6,2) NOT NULL,
    "multa" DECIMAL(6,2) NOT NULL,
    "lucro" DECIMAL(7,2),
    "variacao_caixa" DECIMAL(8,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
