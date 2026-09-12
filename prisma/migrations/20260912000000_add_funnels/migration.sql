-- CreateEnum
CREATE TYPE "FunnelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "funnels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Funnel',
    "status" "FunnelStatus" NOT NULL DEFAULT 'DRAFT',
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "funnels_userId_idx" ON "funnels"("userId");

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
