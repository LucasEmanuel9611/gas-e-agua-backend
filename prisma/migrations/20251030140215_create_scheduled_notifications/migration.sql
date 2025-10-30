-- CreateTable
CREATE TABLE `ScheduledNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `target_users` VARCHAR(191) NULL,
    `target_roles` VARCHAR(191) NULL,
    `scheduled_for` DATETIME(3) NOT NULL,
    `recurrence_pattern` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_sent_at` DATETIME(3) NULL,
    `next_run_at` DATETIME(3) NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `data` VARCHAR(191) NULL,

    INDEX `ScheduledNotification_scheduled_for_idx`(`scheduled_for`),
    INDEX `ScheduledNotification_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
