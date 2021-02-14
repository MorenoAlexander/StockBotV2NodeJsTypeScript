import express from 'express';
import bodyParser from 'body-parser';
import cookieParser  from 'cookie-parser';

import {DiscordManager} from './services/DiscordManager'
import serverconfig from '../serverconfig.json';
import Firebase from 'firebase'

const app = express()



//Initialize DB service
Firebase.initializeApp(serverconfig.firebaseInit)

//Discord class
const discordManager = new DiscordManager();


/**Register middleware **********/

//Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())




/**
 * Endpoints
 */

 // Stock API
 import StockAPI from './stockAPI'

StockAPI(app)



app.listen(serverconfig["port"], () => {
    console.log(`Server is listening on port: ${serverconfig["port"]}`)
    console.log('Server ready, commencing initialization.')

    discordManager.setUp(app)

    discordManager.logIn(serverconfig["DiscordKey"]);
});
