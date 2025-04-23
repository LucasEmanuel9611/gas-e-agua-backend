/*
  Warnings:

  - You are about to drop the column `payment_status` on the `Order` table. All the data in the column will be lost.
  - Made the column `payment_state` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `payment_status`,
    MODIFY `payment_state` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE';
