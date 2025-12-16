-- CreateTable
CREATE TABLE `NotificationHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivered_at` DATETIME(3) NULL,
    `error` VARCHAR(191) NULL,
    `data` VARCHAR(191) NULL,

    INDEX `NotificationHistory_user_id_idx`(`user_id`),
    INDEX `NotificationHistory_sent_at_idx`(`sent_at`),
    INDEX `NotificationHistory_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
