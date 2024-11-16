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

-- CreateIndex
CREATE UNIQUE INDEX "users_sub_uuid_key" ON "users"("sub_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_token_key" ON "api_tokens"("token");
