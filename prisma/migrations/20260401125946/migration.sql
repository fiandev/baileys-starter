-- CreateTable
CREATE TABLE "MoneyManagerWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoneyManagerTrx" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "moneyManagerWalletId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoneyManagerTrx_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MoneyManagerTrx_moneyManagerWalletId_fkey" FOREIGN KEY ("moneyManagerWalletId") REFERENCES "MoneyManagerWallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MoneyManagerTrx" ("amount", "createdAt", "id", "type", "updatedAt", "userId") SELECT "amount", "createdAt", "id", "type", "updatedAt", "userId" FROM "MoneyManagerTrx";
DROP TABLE "MoneyManagerTrx";
ALTER TABLE "new_MoneyManagerTrx" RENAME TO "MoneyManagerTrx";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
