-- CreateEnum
CREATE TYPE "StatusBoleto" AS ENUM ('ABERTO', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "NotificacaoTipo" AS ENUM ('NOVO', 'VENCE_HOJE', 'VENCE_AMANHA', 'ATRASADO', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DONO', 'OPERADOR');

-- CreateTable
CREATE TABLE "Boleto" (
    "id" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "pagadorNome" TEXT,
    "seuNumero" TEXT,
    "nossoNumero" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusBoleto" NOT NULL DEFAULT 'ABERTO',
    "pagadorDocumento" TEXT,
    "pagadorEmail" TEXT,
    "pagadorTelefone" TEXT,
    "pagadorEndereco" TEXT,
    "pagadorCidade" TEXT,
    "pagadorUF" TEXT,
    "pagadorCEP" TEXT,
    "linhaDigitavel" TEXT,
    "codigoBarras" TEXT,
    "pdfUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "boletoId" TEXT NOT NULL,
    "tipo" "NotificacaoTipo" NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destino" TEXT NOT NULL,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "telefoneDono" TEXT NOT NULL,
    "horaEnvioResumo" TEXT NOT NULL DEFAULT '08:00',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacao_boletoId_idx" ON "Notificacao"("boletoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nome_key" ON "User"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_boletoId_fkey" FOREIGN KEY ("boletoId") REFERENCES "Boleto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
