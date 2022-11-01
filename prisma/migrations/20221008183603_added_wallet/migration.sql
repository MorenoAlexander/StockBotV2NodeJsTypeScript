-- CreateTable
CREATE TABLE "Wallet" (
    "userId" TEXT NOT NULL,
    "cryptoSymbol" TEXT NOT NULL,
    "costBasis" MONEY NOT NULL,
    "averagePrice" MONEY NOT NULL,
    "quantity" MONEY NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("userId","cryptoSymbol")
);
