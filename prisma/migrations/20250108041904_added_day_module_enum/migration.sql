/*
  Warnings:

  - The primary key for the `CourseSchedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `module` on the `CourseSchedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `day` on the `CourseSchedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Module" AS ENUM ('SpringA', 'SpringB', 'SpringC', 'FallA', 'FallB', 'FallC', 'SummerVacation', 'SpringVacation', 'Annual', 'Unknown');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Intensive', 'Appointment', 'AnyTime', 'Unknown');

-- AlterTable
ALTER TABLE "CourseSchedule" DROP CONSTRAINT "CourseSchedule_pkey",
DROP COLUMN "module",
ADD COLUMN     "module" "Module" NOT NULL,
DROP COLUMN "day",
ADD COLUMN     "day" "Day" NOT NULL,
ADD CONSTRAINT "CourseSchedule_pkey" PRIMARY KEY ("module", "day", "period", "room");
