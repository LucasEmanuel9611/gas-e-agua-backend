/*
  Warnings:

  - You are about to drop the column `gasAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `gasWithBottle` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `waterAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `waterWithBottle` on the `Order` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `OrderAddons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `OrderAddons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitValue` to the `OrderAddons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `gasAmount`,
    DROP COLUMN `gasWithBottle`,
    DROP COLUMN `waterAmount`,
    DROP COLUMN `waterWithBottle`;

-- AlterTable
ALTER TABLE `OrderAddons` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `totalValue` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `unitValue` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `OrderItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitValue` DOUBLE NOT NULL,
    `totalValue` DOUBLE NOT NULL,

    INDEX `OrderItems_orderId_fkey`(`orderId`),
    INDEX `OrderItems_stockId_fkey`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItems` ADD CONSTRAINT `OrderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItems` ADD CONSTRAINT `OrderItems_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
