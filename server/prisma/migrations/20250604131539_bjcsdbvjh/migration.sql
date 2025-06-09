/*
  Warnings:

  - You are about to drop the column `emailverified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `numberverified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailverified",
DROP COLUMN "numberverified";
