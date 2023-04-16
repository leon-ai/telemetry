-- AlterTable
ALTER TABLE "Utterance" ADD COLUMN     "nluProcessingTime" DOUBLE PRECISION,
ADD COLUMN     "processingTime" DOUBLE PRECISION,
ALTER COLUMN "executionTime" DROP NOT NULL;
