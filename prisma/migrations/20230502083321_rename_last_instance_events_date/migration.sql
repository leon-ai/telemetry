/*
  Warnings:

  - You are about to drop the column `lastStartedAt` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the column `lastStoppedAt` on the `Instance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "lastStartedAt",
DROP COLUMN "lastStoppedAt",
ADD COLUMN     "lastStartAt" TIMESTAMP(3),
ADD COLUMN     "lastStopAt" TIMESTAMP(3);
