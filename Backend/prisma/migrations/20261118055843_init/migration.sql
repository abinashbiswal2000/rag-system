-- CreateTable
CREATE TABLE "NoteTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source_type" TEXT NOT NULL DEFAULT 'TEXT',
    "heading" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "timeStamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VectorTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "vector" TEXT NOT NULL,
    "noteTableId" INTEGER NOT NULL,
    CONSTRAINT "VectorTable_noteTableId_fkey" FOREIGN KEY ("noteTableId") REFERENCES "NoteTable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
