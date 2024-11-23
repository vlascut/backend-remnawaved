/*
  Warnings:

  - You are about to drop the column `bill_cycle` on the `nodes` table. All the data in the column will be lost.
  - You are about to drop the column `bill_date` on the `nodes` table. All the data in the column will be lost.
  - You are about to drop the column `is_bill_tracking_active` on the `nodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_tokens" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "keygen" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "bill_cycle",
DROP COLUMN "bill_date",
DROP COLUMN "is_bill_tracking_active",
ADD COLUMN     "is_traffic_tracking_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "traffic_reset_day" INTEGER DEFAULT 0,
ALTER COLUMN "notify_percent" SET DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes_traffic_usage_history" ALTER COLUMN "reset_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "nodes_usage_history" ALTER COLUMN "created_at" SET DEFAULT date_trunc('hour', now());

-- AlterTable
ALTER TABLE "nodes_user_usage_history" ALTER COLUMN "created_at" SET DEFAULT date_trunc('hour', now());

-- AlterTable
ALTER TABLE "user_traffic_history" ALTER COLUMN "reset_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "xray_config" ALTER COLUMN "updated_at" SET DEFAULT now();
