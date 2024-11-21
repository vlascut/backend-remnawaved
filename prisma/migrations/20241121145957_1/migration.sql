/*
  Warnings:

  - Added the required column `type` to the `inbounds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_tokens" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "inbounds" ADD COLUMN     "type" TEXT NOT NULL;

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
