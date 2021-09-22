import { User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import Quote from '../interfaces/stocks/quote'
import StockLot from '../interfaces/stocks/StockLot'
import { v4 as uuidv4 } from 'uuid'
import StockUser from '../interfaces/stocks/StockUser'
import { formatNumber, formatPercentage } from '../utils/formatFunc'
import logger from '../utils/WinstonLogger'
import { database } from './FirebaseAdminService'
import {
  ref,
  get,
  set,
  orderByChild,
  query,
  equalTo,
  remove,
} from 'firebase/database'
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
    const userData = (
      await get(ref(database, `users/${user.id}`))
    ).val() as StockUser

    let balance = userData.Cash
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
    let userData = await GetUserData(user.id)
    let userStocks = await GetUserStocksAsMap(user.id, quotesymbol)
    let quote = await GetQuote(quotesymbol)

    userStocks.forEach(async (stock: StockLot, key) => {
      if (stock.quantity >= orderCount - stocksSold) {
        stock.quantity -= orderCount - stocksSold
        stocksSold += orderCount - stocksSold
      } else if (
        stock.quantity <= orderCount - stocksSold &&
        stock.quantity >= 1
      ) {
        stocksSold += stock.quantity
        stock.quantity = 0
      }

      if (stock.quantity <= 0) {
        await remove(ref(database, `stocks/${key}`))
      } else {
        await set(ref(database, `stocks/${key}`), stock)
      }
    })

    let balance = userData.Cash
    let credit = stocksSold * quote.c
    balance += credit
    await set(ref(database, `users/${user.id}/Cash`), balance)

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
    if (symbol !== userStocks[i].symbol) {
      quote = await GetQuote(userStocks[i].symbol)
      currentPrice = quote.c
      symbol = userStocks[i].symbol
    }

    marketVal += userStocks[i].quantity * currentPrice
    costBasis += userStocks[i].quantity * userStocks[i].priceBought
    i++
  }

  const PnL = ((marketVal - costBasis) / costBasis) * 100

  return `${user.username}'s portfolio value is ${formatNumber(
    marketVal
  )} ${formatPercentage(PnL)}`
}

export async function GetBalance(user: User): Promise<number> {
  return (await get(ref(database, `users/${user.id}/Cash`))).val()
}

export async function ListStock(user: User): Promise<string> {
  let result = '```'

  logger.info('test')
  const userStocks = await GetUserStocksAsArray(user.id)

  logger.info('length of array:' + userStocks.length)
  userStocks.forEach((stock) => {
    result += `${stock.quantity} ${stock.symbol} @ ${formatNumber(
      stock.priceBought
    )}/share\n`
  })

  result += '```'

  return result
}

// #### PRIVATE FUNCTIONS ####

async function GetUserData(userId: string): Promise<StockUser> {
  return (await get(ref(database, `users/${userId}`))).val()
}

async function GetUserStocksAsArray(userId: string): Promise<StockLot[]> {
  return (Object.values(
    (
      await get(
        query(ref(database, 'stocks'), orderByChild('ID'), equalTo(userId))
      )
    ).val()
  ) as StockLot[]).sort(stockSortBySymbol)
}
/**
 * creates a map of stocks with the same symbols. Primarily used by the Sell function
 * @param userId
 * @param symbol
 */
async function GetUserStocksAsMap(
  userId: string,
  symbol: string
): Promise<Map<string, StockLot>> {
  let stocks = (
    await get(
      query(ref(database, 'stocks'), orderByChild('ID'), equalTo(userId))
    )
  ).val()

  let keys = Object.keys(stocks)
  const map = new Map<string, StockLot>()
  keys.forEach((key) => {
    if (stocks[key].symbol === symbol) {
      map.set(key, stocks[key])
    }
  })
  return map
}

const stockSortBySymbol = (a: StockLot, b: StockLot) => {
  if (a.symbol === b.symbol) {
    return a.priceBought > b.priceBought ? 1 : -1
  } else if (a.symbol > b.symbol) {
    return 1
  }
  return -1
}
