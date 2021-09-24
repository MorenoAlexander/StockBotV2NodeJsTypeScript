import { User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import Quote from '../interfaces/stocks/quote'
import StockLot from '../interfaces/stocks/StockLot'
import { v4 as uuidv4 } from 'uuid'
import StockUser from '../interfaces/stocks/StockUser'
import { formatNumber, formatPercentage } from '../utils/formatFunc'
import logger from '../utils/WinstonLogger'
import { database } from './FirebaseAdminService'
import { equalTo, get, orderByChild, query, ref, remove, set } from 'firebase/database'
import FinnhubService from './FinnhubService'

const finnhubClient = FinnhubService.getInstance(finnhubApiKey)

export async function SignUp(user: User): Promise<string> {
  const newUser = {
    ID: user.id,
    GUID: uuidv4(),
    Cash: 1000.0,
    Username: user.username,
  } as StockUser
  //
  try {
    const allStocks = Object.keys(
      await (
        await get(
          query(ref(database, 'users'), orderByChild('ID'), equalTo(user.id))
        )
      ).val()
    )

    if (allStocks.length > 0) {
      allStocks.forEach((stockLotKey: string) => {
        remove(ref(database, `stocks/${stockLotKey}`))
      })
    }
  } catch (err) {
    logger.error(err)
  }

  await set(ref(database, `users/${user.id}`), newUser)

  return `Welcome to the market! Your starting balance is ${formatNumber(
    newUser.Cash
  )}`
}

export async function GetQuote(SYMBOL: string) {
  return await finnhubClient.Quote(SYMBOL)
}

export async function BuyStock(
  user: User,
  quote: Quote,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  try {
    const newStockLot = {
      ID: user.id,
      Date: new Date().toUTCString(),
      quantity: orderCount,
      priceBought: quote.c,
      symbol: quotesymbol,
      GUID: user.avatar,
    } as StockLot
    const userData = await GetUserData(user.id)

    if (!userData) {
      throw new Error('User is not valid. Sign up first.')
    }

    let balance = userData.get('cash')
    const cost = newStockLot.priceBought * newStockLot.quantity

    if (balance >= cost) {
      balance -= cost
      await set(ref(database, `users/${user.id}/Cash`), balance)
      await set(ref(database, `stocks/${uuidv4}`), newStockLot)
    } else {
      return `You cannot afford to purchase this, your balance is only ${formatNumber(
        balance
      )}`
    }

    return `You've Successfully purchased ${orderCount} shares of ${quotesymbol} @ ${formatNumber(
      newStockLot.priceBought
    )}/share for a total cost of ${formatNumber(cost)}!`
  } catch (e) {
    throw e
  }
}

export async function SellStock(
  user: User,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  try {
    let stocksSold = 0.0
    const userData = await GetUserData(user.id)
    const userStocks = await GetUserStocksAsMap(user.id, quotesymbol)
    const quote = await GetQuote(quotesymbol)

    const stockPromises = userStocks.map(async (stock) => {
      if (stock.get('quantity') >= orderCount - stocksSold) {
        stock.set('quantity', stock.get('quantity') - orderCount - stocksSold)
        stocksSold = stocksSold + (orderCount - stocksSold)
      } else if (
        stock.get('quantity') <= orderCount - stocksSold &&
        stock.get('quantity') >= 1
      ) {
        stocksSold = stocksSold + stock.get('quantity')
        stock.set('quantity',0)
      }

      if (stock.get('quantity') <= 0) {
        return stock.destroy({useMasterKey: true})
      } else {
        return stock.save(null, {useMasterKey: true})
      }
    })

    await Promise.all(stockPromises);

    let balance = userData?.get('cash') || 0.0
    const credit = stocksSold * quote.c
    balance += credit
    userData?.set('cash', balance)
    await userData?.save(null, {useMasterKey: true})


    return `Sold ${stocksSold} shares of ${quotesymbol} @ ${formatNumber(
      quote.c
    )}/sh for a total of ${formatNumber(credit)}!`
  } catch (e) {
    logger.error(e.message)
    return 'Error'
  }
}

/**
 * Fetches user's stocks, calculates the total portfolio value &
 * @param user
 */
export async function CalculatePortforlio(user: User): Promise<string> {
  const userStocks = await GetUserStocksAsArray(user.id)

  let marketVal = 0.0
  let costBasis = 0.0

  let quote = null
  let symbol = ''
  let currentPrice = 0.0
  let i = 0
  while (i < userStocks.length) {
    if (symbol !== userStocks[i].get('symbol')) {
      quote = await GetQuote(userStocks[i].get('symbol'))
      currentPrice = quote.c
      symbol = userStocks[i].get('symbol')
    }

    marketVal += userStocks[i].get('quantity') * currentPrice
    costBasis += userStocks[i].get('quantity') * userStocks[i].get('priceBought')
    i++
  }

  const PnL = ((marketVal - costBasis) / costBasis) * 100

  return `${user.username}'s portfolio value is ${formatNumber(
    marketVal
  )} ${formatPercentage(PnL)}`
}

export async function GetBalance(user: User): Promise<number> {
  return (await new Parse.Query(Parse.User).equalTo('discordID', user.id).first())?.get('cash') || 0.0
}

export async function ListStock(user: User): Promise<string> {
  let result = '```'
  const userStocks = await GetUserStocksAsArray(user.id)

  userStocks.forEach((stock) => {
    result += `${stock.get('quantity')} ${stock.get('symbol')} @ ${formatNumber(
      stock.get('priceBought')
    )}/share\n`
  })

  result += '```'

  return result
}

// #### PRIVATE FUNCTIONS ####

async function GetUserData(userId: string): Promise<Parse.User<Parse.Attributes> | undefined> {
  return (await new Parse.Query(Parse.User).equalTo('discordID', userId).first())
}

async function GetUserStocksAsArray(userId: string) {
  return (await new Parse.Query('StockLot')
    .equalTo('discordID', userId)
    .addDescending('symbol')
      .find())
}
/**
 * creates a map of stocks with the same symbols. Primarily used by the Sell function
 * @param userId
 * @param symbol
 */
async function GetUserStocksAsMap(
  userId: string,
  symbol: string
): Promise<Parse.Object<Parse.Attributes>[]> {
  return await new Parse.Query('StockLot')
    .equalTo('symbol', symbol)
    .equalTo('discordID', userId)
    .ascending('Date')
    .find();
}
