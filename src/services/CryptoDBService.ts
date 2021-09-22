import { Message, User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import ICrypto from '../interfaces/crypto/crypto'
import { formatNumber } from '../utils/formatFunc'
import FinnhubService from './FinnhubService'
import { database } from './FirebaseAdminService'
import { ref, get, set } from 'firebase/database'
import Logger from '../utils/WinstonLogger'
import StockUser from '../interfaces/stocks/StockUser'

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
    let userData = (
      await get(ref(database, `users/${user.id}`))
    ).val() as StockUser

    let costBasis = (cryptoQuote.c as number) * quantity
    let newUserBalance = userData.Cash - costBasis

    if (newUserBalance >= 0) {
      // get user's crypto 'wallet' for this particular crypto
      let userWalletData = (
        await get(ref(database, `${SYMBOL}_wallets/${user.id}`))
      ).toJSON() as CryptoWallet

      if (userWalletData === null) {
        //Add data to DB?
        let newWalletData = {} as CryptoWallet
        newWalletData.averagePrice = cryptoQuote.c as number
        newWalletData.costBasis = quantity * (cryptoQuote.c as number)
        newWalletData.quantity = quantity

        await set(ref(database, `${SYMBOL}_wallets/${user.id}`), newWalletData)
      } else {
        userWalletData.costBasis += quantity * (cryptoQuote.c as number)
        userWalletData.quantity += quantity
        userWalletData.averagePrice =
          userWalletData.costBasis / userWalletData.quantity

        await set(ref(database, `${SYMBOL}_wallets/${user.id}`), userWalletData)
      }

      await set(ref(database, `users/${user.id}/Cash`), newUserBalance)

      return `Successfully purchased ${quantity} ${SYMBOL} for a total of ${formatNumber(
        quantity * (cryptoQuote.c as number)
      )}!`
    } else {
      return `You cannot afford to purhcase this, your balance is only ${formatNumber(
        userData.Cash
      )}!`
    }
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
