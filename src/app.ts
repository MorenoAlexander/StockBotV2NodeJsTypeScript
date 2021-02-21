import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import { DiscordManager } from './services/DiscordManager'
import serverconfig from '../serverconfig.json'
import FirebaseAdmin from 'firebase-admin'

const FirebaseAdminAccount = require('../FirebaseAdminAccount.json')

const app = express()

//Initialize DB service
FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(FirebaseAdminAccount),
  databaseURL: 'https://stockbot-c6e15.firebaseio.com'
})

//Discord class
const discordManager = new DiscordManager()

/**Register middleware **********/

//Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

/**
 * Endpoints
 */

// Stock API
import StockAPI from './controllers/StockController'

StockAPI(app)

// Static files for internal dashboard
app.use(express.static('./clientapp/dist'))

app.listen(serverconfig['port'], () => {
  console.log(`Server is listening on port: ${serverconfig['port']}`)
  console.log('Server ready, commencing initialization.')

  discordManager.setUp(app)

  discordManager.logIn(serverconfig['DiscordKey'])
})
