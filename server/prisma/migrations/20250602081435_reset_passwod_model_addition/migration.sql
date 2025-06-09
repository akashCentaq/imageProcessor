-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPassword" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;
