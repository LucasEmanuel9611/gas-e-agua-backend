-- AlterTable: Add unique constraints to User table
ALTER TABLE `User` ADD UNIQUE INDEX `User_email_key`(`email`);
ALTER TABLE `User` ADD UNIQUE INDEX `User_telephone_key`(`telephone`);

-- AlterTable: Add unique constraint to NotificationToken and index on is_valid
ALTER TABLE `NotificationToken` ADD UNIQUE INDEX `NotificationToken_token_key`(`token`);
CREATE INDEX `NotificationToken_is_valid_idx` ON `NotificationToken`(`is_valid`);

