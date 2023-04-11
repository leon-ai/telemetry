/*
  Warnings:

  - You are about to drop the column `activeOwnersNb` on the `DailyMetric` table. All the data in the column will be lost.
  - Added the required column `activeInstancesNb` to the `DailyMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instancesNb` to the `DailyMetric` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyMetric" DROP COLUMN "activeOwnersNb",
ADD COLUMN     "activeInstancesNb" INTEGER NOT NULL,
ADD COLUMN     "instancesNb" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Instance" ALTER COLUMN "environment" SET DEFAULT '{}';
