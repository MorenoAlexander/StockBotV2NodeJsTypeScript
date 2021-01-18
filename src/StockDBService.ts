import { Message, User } from "discord.js";
import { firebaseInit,finnhubApiKey} from '../serverconfig.json'
import Quote from "./interfaces/stocks/quote";
import StockLot from "./interfaces/stocks/StockLot";
import {v4 as uuidv4 } from 'uuid'
import firebase from 'firebase'
import StockUser from "./interfaces/stocks/StockUser";

import {formatNumber, formatPercentage} from './utils/formatFunc'
const finnhub = require('finnhub')

const finnhubClient = initFinnhub();



const FirebaseApp = initFirebase()

 // const StockQuoteCache = new Map<string,Quote>();




export  async function GetQuote(SYMBOL : string) {

        let data = null
        const request = (await (finnhubClient.quote(SYMBOL)))
        data = JSON.parse((await request).res.text) as Quote;
        return data;
}



export async function BuyStock(user : User, quote : Quote, quotesymbol : string, orderCount : number)  : Promise<string>{
    try {
        const newStockLot = {ID : user.id, Date: new Date().toUTCString(), quantity: orderCount, priceBought: quote.c, symbol: quotesymbol, GUID: user.avatar } as StockLot;
        const userData = (await FirebaseApp.database().ref(`users/${user.id}`).once('value')).val() as StockUser;

        let  balance = userData.Cash;
        const cost = (newStockLot.priceBought * newStockLot.quantity)

        if (balance >= cost ) {
            balance -= cost;
            await FirebaseApp.database().ref(`users/${user.id}/Cash`).set(balance);

            await FirebaseApp.database().ref("stocks").child(uuidv4()).set(newStockLot);
        }
        else {
            return `You cannot afford to purhcase this, your balance is only ${formatNumber(balance)}`
        }

        return `You've Successfully purchased ${orderCount} shares of ${quotesymbol} @ ${formatNumber(newStockLot.priceBought)}/share for a total cost of ${formatNumber(cost)}!`;

    }
    catch (e) {
        throw e;
    }
}




export async function SellStock(user : User, quotesymbol: string, orderCount : number) : Promise<string> {
    try {
        let stocksSold = 0.0;
        let userData = await GetUserData(user.id);
        let userStocks = await GetUserStocksAsMap(user.id, quotesymbol);
        let quote = await GetQuote(quotesymbol)

        userStocks.forEach(async ( stock : StockLot, key ) => {
            if(stock.quantity >= (orderCount - stocksSold)) {
                stock.quantity -= (orderCount - stocksSold)
                stocksSold += (orderCount - stocksSold)
            }
            else if (stock.quantity <= (orderCount - stocksSold) && stock.quantity >= 1) {
                stocksSold += stock.quantity;
                stock.quantity = 0
            }

            if(stock.quantity <= 0) {
                await FirebaseApp.database().ref(`stocks`).child(key).remove()
            }
            else {
                await FirebaseApp.database().ref('stocks').child(key).set(stock);
            }
        })


        let balance = userData.Cash
        let credit = (stocksSold * quote.c)
        balance += credit
        await FirebaseApp.database().ref(`users/${user.id}`).child("Cash").set(balance)



        return `Sold ${stocksSold} shares of ${quotesymbol} @ ${formatNumber(quote.c)}/sh for a total of ${credit}!`
    }
    catch(e) {
        console.log(e);
        return "Error"
    }
}

/**
 * Fetches user's stocks, calculates the total portfolio value &
 * @param user
 */
export async function CalculatePortforlio(user : User) : Promise<string> {

    // const data = (await FirebaseApp.database().ref("stocks").orderByChild("ID").equalTo(user.id).once('value')).val()

    // if(data  == null) {
    //     return `No data found`
    // }
    let userStocks = await GetUserStocksAsArray(user.id);
    //console.log(userStocks)

    let marketVal =  0.0;
    let costBasis = 0.0;

    let quote = null
    let symbol = ""
    let currentPrice = 0.0;
    let i = 0
    while( i< userStocks.length) {
        if(symbol !==  userStocks[i].symbol){
            quote = await GetQuote(userStocks[i].symbol);
            currentPrice = quote.c
            symbol = userStocks[i].symbol
        }

        marketVal += (userStocks[i].quantity * currentPrice)
        costBasis += (userStocks[i].quantity * userStocks[i].priceBought)
        i++

    }

    const PnL = ((marketVal - costBasis) / costBasis)*100;

    return `${user.username}'s portfolio value is ${formatNumber(marketVal)} ${formatPercentage(PnL)}`
}





export async function GetBalance(user : User) : Promise<number>{
    return (await FirebaseApp.database().ref(`users/${user.id}/Cash`).once('value')).val();
}


export async function ListStock(user : User) : Promise<string> {
    let result = "```"

    const userStocks = await GetUserStocksAsArray(user.id);

    //console.log(userStocks)
    userStocks.forEach((stock)=> {
        result += (`${stock.quantity} ${stock.symbol} @ ${formatNumber(stock.priceBought)}/share\n`)
    })

    result += "```"

    return result;
}


// #### PRIVATE FUNCTIONS ####

async function GetUserData(userId : string)  : Promise<StockUser> {
    return (await FirebaseApp.database().ref(`users/${userId}`).once('value')).val();
}

async function GetUserStocksAsArray(userId : string) : Promise<StockLot[]> {
    return (Object.values((await FirebaseApp.database().ref("stocks").orderByChild("ID").equalTo(userId).once('value')).val()) as StockLot[]).sort(stockSortBySymbol)


}
/**
 * creates a map of stocks with the same symbols. Primarily used by the Sell function
 * @param userId 
 * @param symbol 
 */
async function GetUserStocksAsMap(userId : string, symbol : string) : Promise<Map<string, StockLot>> {
    let stocks = (await FirebaseApp.database().ref("stocks").orderByChild("ID").equalTo(userId).once('value')).val()


    let keys = Object.keys(stocks);
    const map = new Map<string,StockLot>()
    keys.forEach((key) => {
        if(stocks[key].symbol === symbol)
        {
            map.set(key,stocks[key])
        }
    })
    return map;
}


function initFirebase() : firebase.app.App {
    console.log(firebaseInit)
    return firebase.initializeApp(firebaseInit)
}




function initFinnhub() {
    
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = finnhubApiKey
    return new finnhub.DefaultApi()
}


const stockSortBySymbol = (a : StockLot,b : StockLot) => {
    if (a.symbol === b.symbol){
        return (a.priceBought > b.priceBought) ? 1 : -1;
    }
    else if(a.symbol > b.symbol ) {
        return 1;

    }
    return -1;
}