/*
  Warnings:

  - Added the required column `local` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Address` ADD COLUMN `local` VARCHAR(191) NOT NULL,
    MODIFY `street` VARCHAR(191) NULL;
