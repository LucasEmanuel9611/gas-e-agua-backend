-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `amount_paid` DOUBLE NOT NULL,
    `new_value` DOUBLE NOT NULL,
    `old_value` DOUBLE NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL DEFAULT 'DINHEIRO',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Payment_order_id_fkey`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
