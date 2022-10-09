import { PrismaClient } from '@prisma/client';
import { User } from 'discord.js';
import ICrypto from '../interfaces/crypto/crypto';
import { formatNumber } from '../utils/formatFunc';
import Logger from '../utils/WinstonLogger';
import FinnhubService from './FinnhubService';

const prismaClient = new PrismaClient();
const finnhubClient = FinnhubService.getInstance(process.env.FINNHUB_API_KEY);

export const GetCryptoQuote = async (SYMBOL: string): Promise<ICrypto> => {
  return finnhubClient.CryptoCandles(SYMBOL);
};

export const BuyCrypto = async (
  user: User,
  quantity: number,
  SYMBOL: string
): Promise<string> => {
  try {
    const cryptoQuote = await GetCryptoQuote(SYMBOL);

    const userData = await prismaClient.user.findFirst({
      where: { discordId: user.id },
    });

    if (!userData) {
      throw new Error(
        'User not found in database! Please sign up and try again.'
      );
    }

    const costBasis = (cryptoQuote.c as number) * quantity;
    const newUserBalance = userData.cash.sub(costBasis);

    if (newUserBalance.greaterThanOrEqualTo(0)) {
      // get user's crypto 'wallet' for this particular crypto
      const userWalletData = await prismaClient.wallet.findFirst({
        where: { cryptoSymbol: SYMBOL, AND: { userId: user.id } },
      });

      if (userWalletData === null) {
        await prismaClient.wallet.create({
          data: {
            cryptoSymbol: SYMBOL,
            averagePrice: cryptoQuote.c as number,
            costBasis: quantity * (cryptoQuote.c as number),
            quantity,
            userId: user.id,
          },
        });
      } else {
        userWalletData.costBasis = userWalletData.costBasis.add(
          userWalletData.quantity.mul(cryptoQuote.c as number)
        );

        userWalletData.quantity = userWalletData.quantity.add(quantity);

        userWalletData.averagePrice = userWalletData.costBasis.div(
          userWalletData.quantity
        );

        await prismaClient.wallet.update({
          where: {
            userId_cryptoSymbol: { cryptoSymbol: SYMBOL, userId: user.id },
          },
          data: userWalletData,
        });
      }

      userData.cash = newUserBalance;

      await prismaClient.user.update({
        where: { discordId: user.id },
        data: userData,
      });

      return `Successfully purchased ${quantity} ${SYMBOL} for a total of ${formatNumber(
        quantity * (cryptoQuote.c as number)
      )}!`;
    }

    return `You cannot afford to purchase this, your balance is only ${formatNumber(
      userData.cash.toNumber()
    )}!`;
  } catch (error) {
    Logger.error(error);
    return `Sumting wong!`;
  }
};

export const SellCrypto = async (
  user: User,
  quantity: number,
  SYMBOL: string
): Promise<string> => {
  try {
    const cryptoQuote: ICrypto = await GetCryptoQuote(SYMBOL);

    // determine how much of SYMBOL this user has
    const userData = await prismaClient.user.findFirst({
      where: { discordId: user.id },
    });

    const UserWallet = await prismaClient.wallet.findFirst({
      where: { userId: user.id, cryptoSymbol: SYMBOL },
    });

    // #region Validation checks

    if (!userData) {
      throw new Error('User does not exist in System. Try signing up?');
    }

    if (!UserWallet) {
      throw new Error(`User Wallet for ${SYMBOL} not Found!`);
    }

    if (UserWallet.quantity.sub(quantity).lessThan(0)) {
      throw new Error(`User Wallet does not enough ${SYMBOL} funds`);
    }

    const marketValue = quantity * (cryptoQuote.c as number);

    UserWallet.quantity = UserWallet.quantity.sub(quantity);

    userData.cash = userData.cash.add(marketValue);

    await prismaClient.wallet.update({
      where: { userId_cryptoSymbol: { userId: user.id, cryptoSymbol: SYMBOL } },
      data: UserWallet,
    });

    await prismaClient.user.update({
      where: { discordId: user.id },
      data: userData,
    });

    return `You've successfully sold ${quantity} ${SYMBOL} for a total of ${formatNumber(
      marketValue
    )}`;
  } catch (error) {
    Logger.error(error);
    return `Error while selling ${SYMBOL}, please try again later!`;
  }
};
