import { User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import ICrypto from '../interfaces/crypto/crypto'
import { formatNumber } from '../utils/formatFunc'
import FinnhubService from './FinnhubService'
import Logger from '../utils/WinstonLogger'

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

    const userData = await new Parse.Query(Parse.User)
      .equalTo('discordID', user.id)
      .first()
    if (!userData) {
      throw new Error(
        'User not found in database! Please sign up and try again.'
      )
    }

    let costBasis = (cryptoQuote.c as number) * quantity
    let newUserBalance = userData.get('cash') - costBasis

    if (newUserBalance >= 0) {
      // get user's crypto 'wallet' for this particular crypto
      let userWalletData = await new Parse.Query('Wallet')
        .equalTo('symbol', SYMBOL)
        .equalTo('discordId', user.id)
        .first()

      if (userWalletData === null) {
        //Add data to DB?
        let newWalletData = new (Parse.Object.extend(
          'Wallet'
        ))() as Parse.Object<Parse.Attributes>

        newWalletData.set('averagePrice', cryptoQuote.c as number)
        newWalletData.set('costBasis', quantity * (cryptoQuote.c as number))
        newWalletData.set('quantity', quantity)
        newWalletData.set('discordId', user.id) // TODO: Fixed column name to match rest of database
        newWalletData.set('user', userData.toPointer())
        await newWalletData.save(null, { useMasterKey: true })
      } else {
        userWalletData?.set(
          'cosBasis',
          userWalletData.get('costBasis') + quantity * (cryptoQuote.c as number)
        )
        userWalletData?.set(
          'quantity',
          userWalletData.get('quantity') + quantity
        )
        userWalletData?.set(
          'averagePrice',
          userWalletData.get('costBasis') / userWalletData.get('quantity')
        )

        await userWalletData?.save(null, { useMasterKey: true })
      }

      userData.set('cash', newUserBalance)
      userData.save(null, { useMasterKey: true })

      return `Successfully purchased ${quantity} ${SYMBOL} for a total of ${formatNumber(
        quantity * (cryptoQuote.c as number)
      )}!`
    } else {
      return `You cannot afford to purhcase this, your balance is only ${formatNumber(
        userData.get('cash')
      )}!`
    }
  } catch (error) {
    Logger.error(error)
    return `Sumting wong!`
  }
}
