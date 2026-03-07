/*
  Warnings:

  - You are about to drop the column `location` on the `equipment` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COORDINADOR_INTERVENCION';

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "location",
ADD COLUMN     "park_id" TEXT;

-- CreateTable
CREATE TABLE "parks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "park_equipment_mins" (
    "id" TEXT NOT NULL,
    "park_id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "park_equipment_mins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parks_name_key" ON "parks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "park_equipment_mins_park_id_type_id_key" ON "park_equipment_mins"("park_id", "type_id");

-- AddForeignKey
ALTER TABLE "park_equipment_mins" ADD CONSTRAINT "park_equipment_mins_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "parks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "park_equipment_mins" ADD CONSTRAINT "park_equipment_mins_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "parks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
