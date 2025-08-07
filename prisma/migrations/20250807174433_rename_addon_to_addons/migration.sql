/*
  Warnings:

  - You are about to drop the `Addon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderAddon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderAddon` DROP FOREIGN KEY `OrderAddon_addonId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderAddon` DROP FOREIGN KEY `OrderAddon_orderId_fkey`;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `gasWithBottle` BOOLEAN NULL DEFAULT false;

-- DropTable
DROP TABLE `Addon`;

-- DropTable
DROP TABLE `OrderAddon`;

-- CreateTable
CREATE TABLE `Addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderAddons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `addonId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderAddons` ADD CONSTRAINT `OrderAddons_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAddons` ADD CONSTRAINT `OrderAddons_addonId_fkey` FOREIGN KEY (`addonId`) REFERENCES `Addons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
