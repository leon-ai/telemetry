/*
  Warnings:

  - The values [SET_UP] on the enum `EventName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventName_new" AS ENUM ('SETUP', 'STARTED', 'UTTERANCE', 'HEARTBEAT', 'STOPPED');
ALTER TABLE "Event" ALTER COLUMN "name" TYPE "EventName_new" USING ("name"::text::"EventName_new");
ALTER TYPE "EventName" RENAME TO "EventName_old";
ALTER TYPE "EventName_new" RENAME TO "EventName";
DROP TYPE "EventName_old";
COMMIT;
