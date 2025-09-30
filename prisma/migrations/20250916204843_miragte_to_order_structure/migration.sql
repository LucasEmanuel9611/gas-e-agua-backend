-- AlterTable
ALTER TABLE `OrderAddons` ALTER COLUMN `quantity` DROP DEFAULT,
    ALTER COLUMN `totalValue` DROP DEFAULT,
    ALTER COLUMN `unitValue` DROP DEFAULT;
