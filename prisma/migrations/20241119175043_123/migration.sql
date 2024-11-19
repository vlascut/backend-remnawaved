/*
  Warnings:

  - You are about to drop the column `sub_uuid` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[short_uuid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `short_uuid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_sub_uuid_key";

-- AlterTable
ALTER TABLE "api_tokens" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "keygen" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes_traffic_usage_history" ALTER COLUMN "reset_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes_usage_history" ALTER COLUMN "created_at" SET DEFAULT date_trunc('hour', now());

-- AlterTable
ALTER TABLE "nodes_user_usage_history" ALTER COLUMN "created_at" SET DEFAULT date_trunc('hour', now());

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sub_uuid",
ADD COLUMN     "short_uuid" TEXT NOT NULL,
ADD COLUMN     "subscription_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "xray_config" ALTER COLUMN "updated_at" SET DEFAULT now();

-- CreateIndex
CREATE UNIQUE INDEX "users_short_uuid_key" ON "users"("short_uuid");
