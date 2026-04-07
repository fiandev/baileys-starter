-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 10,
    "exp" BIGINT NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("age", "createdAt", "id", "isPremium", "name", "phone", "updatedAt") SELECT "age", "createdAt", "id", "isPremium", "name", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
