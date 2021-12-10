require('dotenv').config()
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
/**
 * Endpoints
 */
// Stock API
import StockAPI from './controllers/StockController'
import { DiscordManager } from './services/DiscordManager'
const { ParseServer } = require('parse-server')

const app = express()

//Discord class
const discordManager = new DiscordManager()

// Initialize  Parse API

const api = new ParseServer({
  appName: 'StockBot',
  databaseURI: process.env.DATABASE_URI,
  cloud: __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'TEMP_APP_ID',
  masterKey: process.env.MASTER_KEY || 'DEV_MASTER_KEY',
  serverURL: process.env.SERVER_URL || 'http://localhost:17419/parse',
  sessionLength: 86400 * 2,
})

app.use('/parse', api)

/** Register middleware **********/

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

StockAPI(app)

// Static files for internal dashboard
app.use(express.static('./public'))

app.listen(process.env.PORT, async () => {
  console.log(`Server is listening on port: ${process.env.PORT}`)
  console.log('Server ready, commencing initialization.')

  discordManager.setUp(app)
  discordManager.logIn(process.env.DISCORD_KEY as string)
})
