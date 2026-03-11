/*
  Warnings:

  - You are about to drop the column `service_type` on the `service_requests` table. All the data in the column will be lost.
  - Added the required column `equipment_id` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_type_id` to the `service_requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_request_id_fkey";

-- AlterTable
ALTER TABLE "equipment_types" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General';

-- AlterTable
ALTER TABLE "logs" ADD COLUMN     "equipment_id" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "request_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "service_requests" DROP COLUMN "service_type",
ADD COLUMN     "service_type_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "contact_info" TEXT,
ADD COLUMN     "services" TEXT;

-- DropEnum
DROP TYPE "ServiceType";

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_equipment_services" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "equipment_type_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,

    CONSTRAINT "vendor_equipment_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_equipment_services_vendor_id_equipment_type_id_servi_key" ON "vendor_equipment_services"("vendor_id", "equipment_type_id", "service_type_id");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_equipment_services" ADD CONSTRAINT "vendor_equipment_services_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_equipment_services" ADD CONSTRAINT "vendor_equipment_services_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_equipment_services" ADD CONSTRAINT "vendor_equipment_services_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
