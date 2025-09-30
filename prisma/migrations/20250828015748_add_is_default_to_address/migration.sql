-- Drop Foreign Key (confira o nome real com SHOW CREATE TABLE Address)
ALTER TABLE `Address` DROP FOREIGN KEY `Address_user_id_fkey`;

-- Drop antigo índice único
DROP INDEX `Address_user_id_key` ON `Address`;

-- Alter table: adicionar a nova coluna
ALTER TABLE `Address` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;

-- Recriar a foreign key (agora sem unique, permitindo vários endereços)
ALTER TABLE `Address` 
  ADD CONSTRAINT `Address_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- (Opcional) Criar índice normal para acelerar buscas por user_id
CREATE INDEX `Address_user_id_idx` ON `Address`(`user_id`);
