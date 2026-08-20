-- CreateTable
CREATE TABLE `PaymentSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `pix_key` VARCHAR(191) NOT NULL DEFAULT '',
    `recipient_name` VARCHAR(191) NOT NULL DEFAULT '',
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed singleton row
INSERT INTO `PaymentSettings` (`id`, `pix_key`, `recipient_name`, `updated_at`)
VALUES (1, '', '', NOW(3));
