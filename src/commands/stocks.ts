import {Message } from 'discord.js'
import {finnhubApiKey} from '../../serverconfig.json'
import Quote from '../interfaces/stocks/quote'
const finnhub = require('finnhub')


const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = finnhubApiKey

const finnhubClient = new finnhub.DefaultApi()
export = {
    name: 'stock',
    description: 'test',
    async execute(message : Message, args : string[]) {
        console.log(args.length)
        if (args.length == 0) {
            await message.reply("PLEASE INCLUDE A STOCK SYMBOL")
            return;
        }

        const SYMBOL = args[0].toUpperCase();


        finnhubClient.quote(SYMBOL, async (error : any, data : Quote , response : any) => {
            if (response.status == 200) {
                await message.channel.send(`${SYMBOL}: $${data.c}`)
            }
            if(data) {

            }
        })
        await message.reply('NOT IMPLEMENTED. PLEASE WAIT');
    }

}