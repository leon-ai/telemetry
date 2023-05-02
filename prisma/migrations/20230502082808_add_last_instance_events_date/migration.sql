-- AlterTable
ALTER TABLE "Instance" ADD COLUMN     "lastErrorAt" TIMESTAMP(3),
ADD COLUMN     "lastHeartbeatAt" TIMESTAMP(3),
ADD COLUMN     "lastSetupAt" TIMESTAMP(3),
ADD COLUMN     "lastStartedAt" TIMESTAMP(3),
ADD COLUMN     "lastStoppedAt" TIMESTAMP(3),
ADD COLUMN     "lastUtteranceAt" TIMESTAMP(3);
