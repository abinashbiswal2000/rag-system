/*
  Warnings:

  - You are about to drop the column `source_type` on the `NoteTable` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NoteTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceType" TEXT NOT NULL DEFAULT 'TEXT',
    "heading" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "timeStamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_NoteTable" ("content", "heading", "id", "timeStamp") SELECT "content", "heading", "id", "timeStamp" FROM "NoteTable";
DROP TABLE "NoteTable";
ALTER TABLE "new_NoteTable" RENAME TO "NoteTable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
