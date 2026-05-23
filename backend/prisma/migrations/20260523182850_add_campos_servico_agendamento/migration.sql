-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "formaPagamento" TEXT,
ADD COLUMN     "motivoCancelamento" TEXT;

-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "imagemUrl" TEXT;
