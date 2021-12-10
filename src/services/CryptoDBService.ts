import { User } from 'discord.js'
import ICrypto from '../interfaces/crypto/crypto'
import { formatNumber } from '../utils/formatFunc'
import Logger from '../utils/WinstonLogger'
import FinnhubService from './FinnhubService'

const finnhubClient = FinnhubService.getInstance(process.env.FINNHUB_API_KEY)

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

export const SellCrypto = async (
  user: User,
  quantity: number,
  SYMBOL: string
): Promise<string> => {
  try {
    const cryptoQuote: ICrypto = await GetCryptoQuote(SYMBOL)

    // determine how much of SYMBOL this user has
    const userData = await new Parse.Query(Parse.User)
      .equalTo('discordID', user.id)
      .first()

    const UserWallet = await new Parse.Query('Wallet')
      .equalTo('discordId', user.id)
      .equalTo('symbol', SYMBOL)
      .first()

    // #region Validation checks

    if (!userData) {
      throw new Error('User does not exist in System. Try signing up?')
    }

    if (!UserWallet) {
      throw new Error(`User Wallet for ${SYMBOL} not Found!`)
    }

    if (UserWallet.get('quantity') - quantity < 0) {
      throw new Error(`User Wallet does not enough ${SYMBOL} funds`)
    }

    //#endregion

    const marketValue = quantity * (cryptoQuote.c as number)

    UserWallet.set('quantity', UserWallet.get('quantity') - quantity)
    userData.set('cash', userData.get('cash') + marketValue)

    await UserWallet.save(null, { useMasterKey: true })
    await userData.save(null, { useMasterKey: true })

    return `You've successfully sold ${quantity} ${SYMBOL} for a total of ${formatNumber(
      marketValue
    )}`
  } catch (error: any) {
    Logger.error(error)
    return error.message
  }
}
