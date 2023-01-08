import { config } from 'dotenv';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import StockAPI from './controllers/StockController';
import { DiscordManager } from './services/DiscordManager';

config();

const app = express();

// Discord class
const discordManager = new DiscordManager();

/** Register middleware ********* */

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

StockAPI(app);

// Static files for internal dashboard
app.use(express.static('./public'));

app.listen(process.env.PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port: ${process.env.PORT}`);
  // eslint-disable-next-line no-console
  console.log('Server ready, commencing initialization.');

  discordManager.setUp(app);
  discordManager.logIn(process.env.DISCORD_KEY as string);

  if (process.env.REGISTER_COMMANDS_ON_STARTUP === '1') {
    discordManager.registerCommands();
  }
});

app.get('/', (req, res) => {
  res.send('<h1>DISCORD REGISTERED</h1>');
});
