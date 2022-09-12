-- CreateEnum
CREATE TYPE "Action" AS ENUM ('BUY', 'SELL', 'RESET');

-- CreateTable
CREATE TABLE "User" (
    "discordId" TEXT NOT NULL,
    "username" TEXT,
    "cash" MONEY NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("discordId")
);

-- CreateTable
CREATE TABLE "Stock" (
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceBought" MONEY NOT NULL,
    "stockSymbol" TEXT NOT NULL,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "Action" NOT NULL,
    "actionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StocksOwned" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");

-- CreateIndex
CREATE INDEX "user_stocklots" ON "StockLot"("userId", "stockSymbol", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "_StocksOwned_AB_unique" ON "_StocksOwned"("A", "B");

-- CreateIndex
CREATE INDEX "_StocksOwned_B_index" ON "_StocksOwned"("B");

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_stockSymbol_fkey" FOREIGN KEY ("stockSymbol") REFERENCES "Stock"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActions" ADD CONSTRAINT "UserActions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StocksOwned" ADD CONSTRAINT "_StocksOwned_A_fkey" FOREIGN KEY ("A") REFERENCES "Stock"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StocksOwned" ADD CONSTRAINT "_StocksOwned_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;
