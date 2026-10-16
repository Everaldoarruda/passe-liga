-- CreateTable
CREATE TABLE "escalacoes" (
    "clube_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalacoes_pkey" PRIMARY KEY ("clube_id","jogador_id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" SERIAL NOT NULL,
    "mandante_id" INTEGER NOT NULL,
    "visitante_id" INTEGER NOT NULL,
    "gols_mandante" INTEGER NOT NULL,
    "gols_visitante" INTEGER NOT NULL,
    "formacao_mandante" VARCHAR(5) NOT NULL,
    "formacao_visitante" VARCHAR(5) NOT NULL,
    "jogada_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duelos_partida" (
    "id" SERIAL NOT NULL,
    "partida_id" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "clube_atacante_id" INTEGER NOT NULL,
    "atacante_id" INTEGER NOT NULL,
    "defensor_id" INTEGER NOT NULL,
    "nome_atacante" VARCHAR(100) NOT NULL,
    "nome_defensor" VARCHAR(100) NOT NULL,
    "posicao_atacante" VARCHAR(3) NOT NULL,
    "posicao_defensor" VARCHAR(3) NOT NULL,
    "condicao_atacante" VARCHAR(20) NOT NULL,
    "condicao_defensor" VARCHAR(20) NOT NULL,
    "atributo_ataque" VARCHAR(10) NOT NULL,
    "atributo_defesa" VARCHAR(10) NOT NULL,
    "valor_ataque" INTEGER NOT NULL,
    "valor_defesa" INTEGER NOT NULL,
    "gol" BOOLEAN NOT NULL,

    CONSTRAINT "duelos_partida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "escalacoes_jogador_id_key" ON "escalacoes"("jogador_id");

-- AddForeignKey
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_clube_id_fkey" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalacoes" ADD CONSTRAINT "escalacoes_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_mandante_id_fkey" FOREIGN KEY ("mandante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_clube_atacante_id_fkey" FOREIGN KEY ("clube_atacante_id") REFERENCES "clubes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_atacante_id_fkey" FOREIGN KEY ("atacante_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duelos_partida" ADD CONSTRAINT "duelos_partida_defensor_id_fkey" FOREIGN KEY ("defensor_id") REFERENCES "jogadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
