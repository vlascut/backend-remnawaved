/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `nodes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address]` on the table `nodes` will be added. If there are existing duplicate values, this will fail.

*/
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
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "xray_config" ALTER COLUMN "updated_at" SET DEFAULT now();

-- CreateIndex
CREATE UNIQUE INDEX "nodes_name_key" ON "nodes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_address_key" ON "nodes"("address");
