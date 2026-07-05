CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

ALTER TABLE "Enrollment" ADD COLUMN "orderId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Enrollment" ADD COLUMN "enrollmentStatus" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Enrollment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Enrollment" SET "paymentStatus" = 'PAID', "enrollmentStatus" = 'ACTIVE';
