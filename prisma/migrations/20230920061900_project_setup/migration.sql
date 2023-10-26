-- CreateEnum
CREATE TYPE "ClientScope" AS ENUM ('WEB', 'MOBILE', 'MICROSERVICE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "nellys_coin_user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "friendly_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "max_client_count" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_history" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "reason" TEXT NOT NULL,
    "data" JSONB,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "friendly_name" TEXT,
    "secret_key" TEXT NOT NULL,
    "scope" "ClientScope" NOT NULL,
    "service_id" INTEGER NOT NULL,
    "should_expire" BOOLEAN NOT NULL DEFAULT true,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "was-generated" BOOLEAN NOT NULL DEFAULT false,
    "should_apply_ip_check" BOOLEAN NOT NULL DEFAULT false,
    "ip_white_list" JSONB,
    "created_by" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_history" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "reason" TEXT NOT NULL,
    "data" JSONB,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_configuration" (
    "id" SERIAL NOT NULL,
    "send_slack_alert" BOOLEAN NOT NULL DEFAULT true,
    "send_email" BOOLEAN NOT NULL DEFAULT false,
    "email_address_recipients" JSONB,
    "service_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_configuration_history" (
    "id" SERIAL NOT NULL,
    "alert_configuration_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "reason" TEXT NOT NULL,
    "data" JSONB,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_configuration_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_username_key" ON "customer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "customer_nellys_coin_user_id_key" ON "customer"("nellys_coin_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_code_key" ON "service"("code");

-- CreateIndex
CREATE UNIQUE INDEX "client_public_id_key" ON "client"("public_id");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_history" ADD CONSTRAINT "client_history_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_history" ADD CONSTRAINT "client_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_history" ADD CONSTRAINT "client_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configuration" ADD CONSTRAINT "alert_configuration_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configuration" ADD CONSTRAINT "alert_configuration_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configuration_history" ADD CONSTRAINT "alert_configuration_history_alert_configuration_id_fkey" FOREIGN KEY ("alert_configuration_id") REFERENCES "alert_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configuration_history" ADD CONSTRAINT "alert_configuration_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configuration_history" ADD CONSTRAINT "alert_configuration_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
