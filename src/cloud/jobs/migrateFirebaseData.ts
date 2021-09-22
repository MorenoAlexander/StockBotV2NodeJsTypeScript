import { database } from '../../services/FirebaseAdminService'
import { get, query, ref, orderByChild } from 'firebase/database'
import logger from '../../utils/WinstonLogger'
import StockLot from '../../interfaces/stocks/StockLot'

export async function job_convertFireBaseData(
  request: Parse.Cloud.FunctionRequest
) {
  // get users

  const firebaseUsersStocks: StockLot[] = Object.values(
    (await get(query(ref(database, 'stocks'), orderByChild('ID')))).val()
  )

  firebaseUsersStocks.forEach((stock: StockLot) => {
    const StockLot = Parse.Object.extend('StockLot')
    const stockLot = new StockLot() as Parse.Object<Parse.Attributes>
    stockLot.set('Date', stock.Date)
    stockLot.set('ID', stock.ID.toString())
    stockLot.set('GUID', stock.GUID)
    stockLot.set('priceBought', stock.priceBought)
    stockLot.set('quantity', stock.quantity)
    stockLot.set('symbol', stock.symbol)
    stockLot.save(null, { useMasterKey: true })
  })

  logger.info(JSON.stringify(firebaseUsersStocks))
  return ''
}
