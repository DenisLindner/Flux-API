ALTER TABLE "users"
ADD COLUMN "avatarData" BYTEA,
ADD COLUMN "avatarMimeType" TEXT;

ALTER TABLE "messages"
ADD COLUMN "readAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "messages_receiverId_readAt_idx" ON "messages"("receiverId", "readAt");
