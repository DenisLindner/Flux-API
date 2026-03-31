/*
  Warnings:

  - The primary key for the `follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followedById` on the `follows` table. All the data in the column will be lost.
  - Added the required column `followerId` to the `follows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followedById_fkey";

-- AlterTable
ALTER TABLE "follows" DROP CONSTRAINT "follows_pkey",
DROP COLUMN "followedById",
ADD COLUMN     "followerId" TEXT NOT NULL,
ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
