-- AlterTable
ALTER TABLE "Utterance" ALTER COLUMN "triggeredDomain" DROP NOT NULL,
ALTER COLUMN "triggeredSkill" DROP NOT NULL,
ALTER COLUMN "triggeredAction" DROP NOT NULL,
ALTER COLUMN "triggeredSkillVersion" DROP NOT NULL,
ALTER COLUMN "probability" DROP NOT NULL;
