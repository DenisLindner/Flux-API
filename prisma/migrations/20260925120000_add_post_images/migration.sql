ALTER TABLE "posts"
ADD COLUMN "imageData" BYTEA,
ADD COLUMN "imageMimeType" TEXT,
ALTER COLUMN "content" SET DEFAULT '';
