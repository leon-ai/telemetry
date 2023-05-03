/*
  Warnings:

  - You are about to drop the column `uptime` on the `Instance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "uptime",
ADD COLUMN     "lastUptime" BIGINT;
