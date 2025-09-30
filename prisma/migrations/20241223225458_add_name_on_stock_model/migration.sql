/*
  Warnings:

  - You are about to drop the column `type` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `name` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Stock` DROP COLUMN `type`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
