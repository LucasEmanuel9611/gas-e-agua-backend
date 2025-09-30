/*
  Warnings:

  - Added the required column `type` to the `Addons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Address` DROP FOREIGN KEY `Address_user_id_fkey`;

-- AlterTable
ALTER TABLE `Addons` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Address` RENAME INDEX `Address_user_id_idx` TO `Address_user_id_fkey`;
