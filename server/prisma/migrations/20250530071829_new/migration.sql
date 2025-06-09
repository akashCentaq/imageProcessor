/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Incoming` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Outgoing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Incoming" DROP CONSTRAINT "Incoming_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Incoming" DROP CONSTRAINT "Incoming_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Incoming" DROP CONSTRAINT "Incoming_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "Outgoing" DROP CONSTRAINT "Outgoing_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Outgoing" DROP CONSTRAINT "Outgoing_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Outgoing" DROP CONSTRAINT "Outgoing_userId_fkey";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Incoming";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "Outgoing";
