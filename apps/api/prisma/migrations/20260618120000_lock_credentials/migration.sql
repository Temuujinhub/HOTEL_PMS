-- Smart-lock guest access credentials (RFID card / PIN / digital key)

-- CreateEnum
CREATE TYPE "LockCredentialKind" AS ENUM ('RFID_CARD', 'PIN_CODE', 'DIGITAL_KEY');

-- CreateEnum
CREATE TYPE "LockCredentialStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CredentialIssuedVia" AS ENUM ('FRONT_DESK', 'KIOSK');

-- CreateTable
CREATE TABLE "lock_credentials" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "provider" "LockProvider" NOT NULL DEFAULT 'NONE',
    "type" "LockCredentialKind" NOT NULL DEFAULT 'RFID_CARD',
    "status" "LockCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedVia" "CredentialIssuedVia" NOT NULL DEFAULT 'FRONT_DESK',
    "credentialRef" TEXT NOT NULL,
    "cardId" TEXT,
    "pinCode" TEXT,
    "digitalKeyToken" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lock_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lock_credentials_tenantId_idx" ON "lock_credentials"("tenantId");

-- CreateIndex
CREATE INDEX "lock_credentials_reservationId_idx" ON "lock_credentials"("reservationId");

-- CreateIndex
CREATE INDEX "lock_credentials_roomId_status_idx" ON "lock_credentials"("roomId", "status");

-- AddForeignKey
ALTER TABLE "lock_credentials" ADD CONSTRAINT "lock_credentials_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lock_credentials" ADD CONSTRAINT "lock_credentials_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lock_credentials" ADD CONSTRAINT "lock_credentials_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lock_credentials" ADD CONSTRAINT "lock_credentials_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
