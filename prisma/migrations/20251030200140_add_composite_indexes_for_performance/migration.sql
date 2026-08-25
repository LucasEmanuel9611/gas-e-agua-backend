-- Composite indexes for better query performance
-- Using CREATE INDEX IF NOT EXISTS pattern for idempotency

-- Order queries (check if exists first)
SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `Order_payment_state_created_at_idx` ON `Order`(`payment_state`, `created_at`)',
  'SELECT "Index Order_payment_state_created_at_idx already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'Order' AND index_name = 'Order_payment_state_created_at_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `Order_created_at_payment_state_idx` ON `Order`(`created_at`, `payment_state`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'Order' AND index_name = 'Order_created_at_payment_state_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `Order_interest_allowed_user_id_idx` ON `Order`(`interest_allowed`, `user_id`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'Order' AND index_name = 'Order_interest_allowed_user_id_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `Order_user_id_created_at_idx` ON `Order`(`user_id`, `created_at`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'Order' AND index_name = 'Order_user_id_created_at_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- OrderItems queries
SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `OrderItems_orderId_stockId_idx` ON `OrderItems`(`orderId`, `stockId`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'OrderItems' AND index_name = 'OrderItems_orderId_stockId_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `OrderItems_stockId_quantity_idx` ON `OrderItems`(`stockId`, `quantity`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'OrderItems' AND index_name = 'OrderItems_stockId_quantity_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- OrderAddons queries
SELECT IF(
  COUNT(*) = 0,
  'CREATE INDEX `OrderAddons_orderId_addonId_idx` ON `OrderAddons`(`orderId`, `addonId`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'OrderAddons' AND index_name = 'OrderAddons_orderId_addonId_idx';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Unique constraints (check existence)
SELECT IF(
  COUNT(*) = 0,
  'ALTER TABLE `User` ADD UNIQUE INDEX `User_email_key`(`email`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'User' AND index_name = 'User_email_key';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'ALTER TABLE `User` ADD UNIQUE INDEX `User_telephone_key`(`telephone`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'User' AND index_name = 'User_telephone_key';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT IF(
  COUNT(*) = 0,
  'ALTER TABLE `NotificationToken` ADD UNIQUE INDEX `NotificationToken_token_key`(`token`)',
  'SELECT "Index already exists"'
) INTO @sql FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'NotificationToken' AND index_name = 'NotificationToken_token_key';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
