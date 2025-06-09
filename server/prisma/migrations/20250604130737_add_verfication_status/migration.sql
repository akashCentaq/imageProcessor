-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailverified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberverified" BOOLEAN NOT NULL DEFAULT false;
