-- CreateEnum
CREATE TYPE "EventName" AS ENUM ('SET_UP', 'STARTED', 'UTTERANCE', 'HEARTBEAT', 'STOPPED');

-- CreateTable
CREATE TABLE "DailyMetric" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utterancesNb" INTEGER NOT NULL,
    "setupsNb" INTEGER NOT NULL,
    "onlineInstancesNb" INTEGER NOT NULL,
    "activeOwnersNb" INTEGER NOT NULL,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instanceID" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "language" TEXT NOT NULL,
    "environment" JSONB NOT NULL,
    "sttProvider" TEXT NOT NULL,
    "ttsProvider" TEXT NOT NULL,
    "coreVersion" TEXT NOT NULL,
    "pythonBridgeVersion" TEXT NOT NULL,
    "tcpServerVersion" TEXT NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instanceID" TEXT NOT NULL,
    "name" "EventName" NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utterance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instanceID" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "triggeredDomain" TEXT NOT NULL,
    "triggeredSkill" TEXT NOT NULL,
    "triggeredAction" TEXT NOT NULL,
    "triggeredSkillVersion" TEXT NOT NULL,
    "triggeredSkillBridge" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "language" TEXT NOT NULL,
    "executionTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Utterance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Error" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instanceID" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instance_instanceID_key" ON "Instance"("instanceID");

-- CreateIndex
CREATE UNIQUE INDEX "Event_instanceID_key" ON "Event"("instanceID");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_instanceID_fkey" FOREIGN KEY ("instanceID") REFERENCES "Instance"("instanceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utterance" ADD CONSTRAINT "Utterance_instanceID_fkey" FOREIGN KEY ("instanceID") REFERENCES "Instance"("instanceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Error" ADD CONSTRAINT "Error_instanceID_fkey" FOREIGN KEY ("instanceID") REFERENCES "Instance"("instanceID") ON DELETE RESTRICT ON UPDATE CASCADE;
