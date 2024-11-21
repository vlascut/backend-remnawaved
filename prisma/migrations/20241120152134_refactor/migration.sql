/*
  Warnings:

  - You are about to drop the `active_proxies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "active_proxies" DROP CONSTRAINT "active_proxies_inbound_uuid_fkey";

-- DropForeignKey
ALTER TABLE "active_proxies" DROP CONSTRAINT "active_proxies_user_uuid_fkey";

-- DropForeignKey
ALTER TABLE "nodes_traffic_usage_history" DROP CONSTRAINT "nodes_traffic_usage_history_node_uuid_fkey";

-- DropForeignKey
ALTER TABLE "nodes_usage_history" DROP CONSTRAINT "nodes_usage_history_node_uuid_fkey";

-- DropForeignKey
ALTER TABLE "nodes_user_usage_history" DROP CONSTRAINT "nodes_user_usage_history_node_uuid_fkey";

-- DropForeignKey
ALTER TABLE "nodes_user_usage_history" DROP CONSTRAINT "nodes_user_usage_history_user_uuid_fkey";

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

-- DropTable
DROP TABLE "active_proxies";

-- CreateTable
CREATE TABLE "active_user_inbounds" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uuid" UUID NOT NULL,
    "inbound_uuid" UUID NOT NULL,

    CONSTRAINT "active_user_inbounds_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_user_inbounds_user_uuid_inbound_uuid_key" ON "active_user_inbounds"("user_uuid", "inbound_uuid");

-- AddForeignKey
ALTER TABLE "nodes_traffic_usage_history" ADD CONSTRAINT "nodes_traffic_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_user_usage_history" ADD CONSTRAINT "nodes_user_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_user_usage_history" ADD CONSTRAINT "nodes_user_usage_history_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_usage_history" ADD CONSTRAINT "nodes_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_user_inbounds" ADD CONSTRAINT "active_user_inbounds_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_user_inbounds" ADD CONSTRAINT "active_user_inbounds_inbound_uuid_fkey" FOREIGN KEY ("inbound_uuid") REFERENCES "inbounds"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
