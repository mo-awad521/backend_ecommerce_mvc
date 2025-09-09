/*
  Warnings:

  - Made the column `provider` on table `payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `provider` ENUM('stripe', 'paypal', 'cod', 'bank') NOT NULL,
    MODIFY `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending';
