import IServerConfig from './interfaces/server/IServerconfig'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { DiscordManager } from './services/DiscordManager'
const serverconfig: IServerConfig = require('../serverconfig.json')
import FirebaseAdmin from 'firebase-admin'
const { ParseServer, redisOptions } = require('parse-server')
const FirebaseAdminAccount = require('../FirebaseAdminAccount.json')

const app = express()

//Initialize DB service
FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(FirebaseAdminAccount),
  databaseURL: 'https://stockbot-c6e15.firebaseio.com',
})

//Discord class
const discordManager = new DiscordManager()

// fetch parseServerConfig from server  config
const parseConfig = serverconfig['parseConfig']
// Initialize  Parse API

const api = new ParseServer({
  appName: 'StockBot',
  databaseURI: parseConfig.databaseURI,
  cloud: __dirname + '/cloud/main.js',
  appId: parseConfig.appId || 'TEMP_APP_ID',
  masterKey: parseConfig.masterKey || 'DEV_MASTER_KEY',
  serverURL: parseConfig.serverURL || 'http://localhost:17419/parse',
  sessionLength: 86400 * 2,
})

app.use('/parse', api)

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
app.use(express.static('./public'))

app.listen(serverconfig['port'], () => {
  console.log(`Server is listening on port: ${serverconfig['port']}`)
  console.log('Server ready, commencing initialization.')

  discordManager.setUp(app)
  discordManager.logIn(serverconfig['DiscordKey'] as string)
})
