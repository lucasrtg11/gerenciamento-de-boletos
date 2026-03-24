/*
  Warnings:

  - A unique constraint covering the columns `[numeroBoleto]` on the table `Boleto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Boleto" ADD COLUMN     "numeroBoleto" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_numeroBoleto_key" ON "Boleto"("numeroBoleto");
