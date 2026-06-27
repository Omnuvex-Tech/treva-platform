-- CreateTable
CREATE TABLE "PulseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PulseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PulseCategory_name_key" ON "PulseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PulseCategory_slug_key" ON "PulseCategory"("slug");
