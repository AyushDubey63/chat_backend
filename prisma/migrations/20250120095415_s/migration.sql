/*
  Warnings:

  - The primary key for the `Participants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `Participants` table. All the data in the column will be lost.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `is_seen` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `is_seen_at` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `message_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `message_text` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `message_type` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user1` to the `Participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2` to the `Participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chat_id_fkey";

-- AlterTable
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "user1" INTEGER NOT NULL,
ADD COLUMN     "user2" INTEGER NOT NULL,
ADD CONSTRAINT "Participants_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
DROP COLUMN "is_seen",
DROP COLUMN "is_seen_at",
DROP COLUMN "message_id",
DROP COLUMN "message_text",
DROP COLUMN "message_type",
DROP COLUMN "timestamp",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "chats";

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_user1_fkey" FOREIGN KEY ("user1") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_user2_fkey" FOREIGN KEY ("user2") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
