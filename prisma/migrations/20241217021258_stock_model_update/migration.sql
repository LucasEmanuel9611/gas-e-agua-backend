/*
  Warnings:

  - You are about to drop the column `gas` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `water` on the `Order` table. All the data in the column will be lost.
  - Added the required column `gasAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `gas`,
    DROP COLUMN `water`,
    ADD COLUMN `gasAmount` INTEGER NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL,
    ADD COLUMN `waterAmount` INTEGER NOT NULL;
