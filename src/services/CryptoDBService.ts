import { Message, User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import Firebase from 'firebase-admin'
import ICrypto from '../interfaces/crypto/crypto'

import FinnhubService from './FinnhubService'
import Logger from '../utils/WinstonLogger'
const firebaseApp = Firebase.app()

const finnhubClient = FinnhubService.getInstance(finnhubApiKey)

export const GetCryptoQuote = async (SYMBOL: string): Promise<ICrypto> => {
  return await finnhubClient.CryptoCandles(SYMBOL)
}

export const BuyCrypto = async (
  user: User,
  quantity: number,
  SYMBOL: string
): Promise<string> => {
  try {
    let cryptoQuote = await GetCryptoQuote(SYMBOL)

    // get user's crypto 'wallet' for this particular crypto
    let userWalletData = (
      await firebaseApp
        .database()
        .ref(SYMBOL + '_wallets')
        .child(user.id)
        .once('value')
    ).toJSON() as CryptoWallet

    console.log(userWalletData)
    if (userWalletData === null) {
      //Add data to DB?
      let newWalletData = {} as CryptoWallet
      newWalletData.averagePrice = cryptoQuote.c as number
      newWalletData.costBasis = quantity * (cryptoQuote.c as number)
      newWalletData.quantity = quantity

      await firebaseApp
        .database()
        .ref(SYMBOL + '_wallets')
        .child(user.id)
        .set(newWalletData)
    } else {
      userWalletData.costBasis += quantity * (cryptoQuote.c as number)
      userWalletData.quantity += quantity
      userWalletData.averagePrice =
        userWalletData.costBasis / userWalletData.quantity

      await firebaseApp
        .database()
        .ref(SYMBOL + '_wallets')
        .child(user.id)
        .set(userWalletData)
    }
    return `Successfully purchased ${quantity} ${SYMBOL} for a total of ${
      quantity * (cryptoQuote.c as number)
    }!`
  } catch (error) {
    Logger.error(error)
    return `Sumting wong!`
  }
}

//Child element is user ID
interface CryptoWallet {
  costBasis: number
  averagePrice: number
  quantity: number
}
