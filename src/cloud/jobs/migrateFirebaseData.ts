import { database } from '../../services/FirebaseAdminService'
import { get, query, ref, orderByChild,  } from 'firebase/database'
import logger from '../../utils/WinstonLogger'
import StockLot from '../../interfaces/stocks/StockLot'
import StockUser from '../../interfaces/stocks/StockUser'
import {randomBytes} from 'crypto'
export async function job_convertFireBaseData(
  request: Parse.Cloud.FunctionRequest
) {
  // get users

  const firebaseUsersStocks: StockLot[] = Object.values(
    (await get(query(ref(database, 'stocks'), orderByChild('ID')))).val()
  )

  firebaseUsersStocks.forEach((stock: StockLot) => {
    const StockLotClass = Parse.Object.extend('StockLot')
    const stockLot = new StockLotClass() as Parse.Object<Parse.Attributes>
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

export async function job_migrateUserData(request: Parse.Cloud.FunctionRequest) {
  const firebaseUsers : StockUser[] = Object.values((await get(query(ref(database, 'users'), orderByChild('ID')))).val())

  console.log(firebaseUsers) // eslint-disable-line

  firebaseUsers.forEach(stockUser => {
    const user = new Parse.User()

    user.set('discordID', stockUser.ID.toString())
    user.set('cash', stockUser.Cash)
    user.set('', stockUser.GUID)
    user.set('username',stockUser.Username)
    user.setPassword(randomBytes(16).toString('base64'))
    user.save(null, {useMasterKey: true})
  })
}


