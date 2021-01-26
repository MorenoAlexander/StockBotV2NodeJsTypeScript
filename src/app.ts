import express from 'express';

import {DiscordManager} from './DiscordManager'

import serverconfig from '../serverconfig.json';

import logger from './WinstonLogger'


const app = express()



const discordManager = new DiscordManager();

app.listen(serverconfig["port"], () => {
    console.log(`Server is listening on port: ${serverconfig["port"]}`)
    console.log('Server ready, commencing initialization.')

    discordManager.setUp(app)

    discordManager.logIn(serverconfig["DiscordKey"]);
});
