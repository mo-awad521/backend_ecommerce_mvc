/*
  Warnings:

  - You are about to alter the column `paymentMethod` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - Made the column `provider` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `paymentMethod` ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'COD') NULL;

-- AlterTable
ALTER TABLE `payment` MODIFY `provider` ENUM('STRIPE', 'PAYPAL', 'BANK', 'COD') NOT NULL;

-- CreateIndex
CREATE INDEX `Order_status_idx` ON `Order`(`status`);

-- CreateIndex
CREATE INDEX `Payment_status_idx` ON `Payment`(`status`);

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_userId_fkey` TO `Order_userId_idx`;
