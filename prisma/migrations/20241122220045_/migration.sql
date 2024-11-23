/*
  Warnings:

  - You are about to drop the column `security` on the `hosts` table. All the data in the column will be lost.
  - Made the column `allowinsecure` on table `hosts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_disabled` on table `hosts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "api_tokens" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "hosts" DROP COLUMN "security",
ALTER COLUMN "alpn" DROP NOT NULL,
ALTER COLUMN "alpn" DROP DEFAULT,
ALTER COLUMN "fingerprint" DROP NOT NULL,
ALTER COLUMN "fingerprint" DROP DEFAULT,
ALTER COLUMN "allowinsecure" SET NOT NULL,
ALTER COLUMN "allowinsecure" SET DEFAULT false,
ALTER COLUMN "is_disabled" SET NOT NULL,
ALTER COLUMN "is_disabled" SET DEFAULT false;

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
ALTER TABLE "user_traffic_history" ALTER COLUMN "reset_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "xray_config" ALTER COLUMN "updated_at" SET DEFAULT now();
