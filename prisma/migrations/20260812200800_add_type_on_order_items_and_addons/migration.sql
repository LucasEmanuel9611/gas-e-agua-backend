-- Add denormalized `type` on OrderItems and OrderAddons (already in schema.prisma).
-- Backfill from Stock/Addons so existing rows remain valid.

SELECT IF(
  COUNT(*) = 0,
  'ALTER TABLE `OrderItems` ADD COLUMN `type` VARCHAR(191) NULL',
  'SELECT "Column OrderItems.type already exists"'
) INTO @sql FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'OrderItems' AND column_name = 'type';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `OrderItems` oi
INNER JOIN `Stock` s ON oi.stockId = s.id
SET oi.type = s.type
WHERE oi.type IS NULL OR oi.type = '';

UPDATE `OrderItems` SET `type` = '' WHERE `type` IS NULL;

ALTER TABLE `OrderItems` MODIFY `type` VARCHAR(191) NOT NULL;

SELECT IF(
  COUNT(*) = 0,
  'ALTER TABLE `OrderAddons` ADD COLUMN `type` VARCHAR(191) NULL',
  'SELECT "Column OrderAddons.type already exists"'
) INTO @sql FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'OrderAddons' AND column_name = 'type';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `OrderAddons` oa
INNER JOIN `Addons` a ON oa.addonId = a.id
SET oa.type = a.type
WHERE oa.type IS NULL OR oa.type = '';

UPDATE `OrderAddons` SET `type` = '' WHERE `type` IS NULL;

ALTER TABLE `OrderAddons` MODIFY `type` VARCHAR(191) NOT NULL;
