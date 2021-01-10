import {Message } from 'discord.js'
import {finnhubApiKey} from '../../serverconfig.json'
import Quote from '../interfaces/stocks/quote'

import {BuyStock, GetBalance} from '../StockDBService'


const finnhub = require('finnhub')

const finnhubClient = initFinnhub();







export = [
    {
        name: 'stock',
        description: 'test',
        async execute(message : Message, args : string[]) {
            if (args.length == 0) {
                await message.reply("PLEASE INCLUDE A STOCK SYMBOL")
                return;
            }
            const SYMBOL = args[0].toUpperCase();
            
            finnhubClient.quote(SYMBOL, async (error : any, data : Quote , response : any) => {
                if (response.status == 200) {
                    await message.channel.send(`${SYMBOL}: $${data.c}`)
                }
            })
        }
    },
    {
        name: 'balance',
        description: 'Gets user\'s current balance',
        async execute(message : Message, args : string[]) {
            const messageResponse = (await message.reply(asyncResponse('balance')))
            var val = await GetBalance(message.author)

            messageResponse.edit(formatNumber(val));
        }
    },
    {
        name: 'buy',
        description: 'Buy a stock like this : $buy <SYMBOL> <#>',
        async execute(message : Message, args : string[]) {
            const messageResponse = (await message.reply(asyncResponse('stock')))
            const SYMBOL = args[0].toUpperCase();
            const quantity = parseInt(args[1]);

            
            finnhubClient.quote(SYMBOL, async (error : any, stockQuote : Quote, response : any) => {
                if(stockQuote.c == 0 && stockQuote.o == 0) {
                    messageResponse.edit("No Such Symbol.");
                    return;
                }
                messageResponse.edit(await BuyStock(message.author,stockQuote, SYMBOL, quantity));
            });
        }
    },
    {
        name: 'portfolio',
        description: '',
        async execute(message : Message, args : string[]) {
            //not implemented
            const messageResponse = (await message.reply(asyncResponse('portfolio')))
            console.log(message.author.id);
            console.log(parseInt(message.author.id,2));
            FirebaseApp.database().ref('stocks').orderByChild("ID").equalTo(message.author.id).once('value',(snapshot) => {
                console.log(snapshot.val())
            });
            return;
        }
    },
]


function initFinnhub() {
    
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = finnhubApiKey
    return new finnhub.DefaultApi()
}




function formatNumber( num : Number) {
    return `$${num.toFixed(2)}`
}

//which is better? Not sure.
const asyncResponse = (action : string ) => {
    return `Fetching your ${action}...`
}


