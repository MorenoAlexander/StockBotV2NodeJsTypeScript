import {Message } from 'discord.js'

import Quote from "../interfaces/stocks/quote";
import {BuyStock, GetBalance, GetQuote, CalculatePortforlio} from '../StockDBService'








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

            GetQuote(SYMBOL).then( (data : Quote) => {
                message.channel.send(`${SYMBOL}: $${data.c}`)
            });
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
        name: 'portfolio',
        description: 'calculates your portfolio value',
        async execute(message : Message, args : string[]) {
            const messageResponse = (await message.reply(asyncResponse('portfolio')))

            const result = await CalculatePortforlio(message.author)
            messageResponse.edit(result);
        }
    },
    {
        name: 'buy',
        description: 'calculates your portfolio value',
        async execute(message : Message, args : string[]) {
            const messageResponse = (await message.reply(asyncResponse('stock')))
            const SYMBOL = args[0].toUpperCase();
            const quantity = parseInt(args[1],2);

            const quote = await GetQuote(SYMBOL)

            const result = await BuyStock(message.author,quote,SYMBOL,quantity);

            messageResponse.edit(result);
            return;
        }
    },
]







function formatNumber( num : Number) {
    return `$${num.toFixed(2)}`
}

//which is better? Not sure.
const asyncResponse = (action : string ) => {
    return `Fetching your ${action}...`
}


