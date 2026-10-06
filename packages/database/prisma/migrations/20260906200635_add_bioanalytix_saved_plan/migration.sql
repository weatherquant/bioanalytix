-- CreateTable
CREATE TABLE "bio_plan" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "planVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bio_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bio_plan_householdId_key" ON "bio_plan"("householdId");

-- AddForeignKey
ALTER TABLE "bio_plan" ADD CONSTRAINT "bio_plan_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "bio_household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
