-- AlterTable
ALTER TABLE `Order` ADD COLUMN `interest_allowed` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `total_with_interest` DOUBLE NOT NULL DEFAULT 0;
