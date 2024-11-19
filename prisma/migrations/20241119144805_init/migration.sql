-- CreateTable
CREATE TABLE "users" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "used_traffic_bytes" INTEGER NOT NULL DEFAULT 0,
    "traffic_limit_bytes" INTEGER NOT NULL DEFAULT 0,
    "traffic_limit_strategy" TEXT NOT NULL DEFAULT 'fixed',
    "sub_last_user_agent" TEXT,
    "sub_last_ip" TEXT,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "online_at" TIMESTAMP(3),
    "sub_revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "keygen" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "priv_key" TEXT NOT NULL,
    "pub_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "keygen_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "nodes" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "port" INTEGER,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "is_connecting" BOOLEAN NOT NULL DEFAULT false,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "last_status_change" TIMESTAMP(3),
    "last_status_message" TEXT,
    "xray_version" TEXT,
    "is_bill_tracking_active" BOOLEAN NOT NULL DEFAULT false,
    "bill_date" DATE,
    "bill_cycle" TEXT,
    "traffic_limit_bytes" INTEGER,
    "traffic_used_bytes" INTEGER,
    "notify_percent" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "nodes_traffic_usage_history" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "node_uuid" UUID NOT NULL,
    "traffic_bytes" BIGINT NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "nodes_traffic_usage_history_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "nodes_user_usage_history" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "node_uuid" UUID NOT NULL,
    "user_uuid" UUID NOT NULL,
    "download_bytes" BIGINT NOT NULL,
    "upload_bytes" BIGINT NOT NULL,
    "total_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT date_trunc('hour', now()),

    CONSTRAINT "nodes_user_usage_history_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "nodes_usage_history" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "node_uuid" UUID NOT NULL,
    "download_bytes" BIGINT NOT NULL,
    "upload_bytes" BIGINT NOT NULL,
    "total_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT date_trunc('hour', now()),

    CONSTRAINT "nodes_usage_history_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_sub_uuid_key" ON "users"("sub_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_token_key" ON "api_tokens"("token");

-- AddForeignKey
ALTER TABLE "nodes_traffic_usage_history" ADD CONSTRAINT "nodes_traffic_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_user_usage_history" ADD CONSTRAINT "nodes_user_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_user_usage_history" ADD CONSTRAINT "nodes_user_usage_history_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes_usage_history" ADD CONSTRAINT "nodes_usage_history_node_uuid_fkey" FOREIGN KEY ("node_uuid") REFERENCES "nodes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
