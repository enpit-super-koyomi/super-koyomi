/*
  Warnings:

  - Added the required column `instructor` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "instructor" TEXT NOT NULL;
