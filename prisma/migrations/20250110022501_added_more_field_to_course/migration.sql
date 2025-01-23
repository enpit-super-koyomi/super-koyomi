/*
  Warnings:

  - Added the required column `error` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdate` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "error" BOOLEAN NOT NULL,
ADD COLUMN     "lastUpdate" TIMESTAMP(3) NOT NULL;
