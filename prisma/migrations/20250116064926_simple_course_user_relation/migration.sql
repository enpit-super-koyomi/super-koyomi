/*
  Warnings:

  - You are about to drop the column `credits` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `instructor` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdate` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedGrade` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `CourseSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseSchedule" DROP CONSTRAINT "CourseSchedule_courseCode_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "credits",
DROP COLUMN "error",
DROP COLUMN "instructor",
DROP COLUMN "lastUpdate",
DROP COLUMN "name",
DROP COLUMN "overview",
DROP COLUMN "recommendedGrade",
DROP COLUMN "remarks",
DROP COLUMN "type";

-- DropTable
DROP TABLE "CourseSchedule";

-- DropEnum
DROP TYPE "Day";

-- DropEnum
DROP TYPE "Module";
