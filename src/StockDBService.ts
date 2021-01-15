import { Message, User } from "discord.js";
import { firebaseInit,finnhubApiKey} from '../serverconfig.json'
import Quote from "./interfaces/stocks/quote";
import StockLot from "./interfaces/stocks/StockLot";
import {v4 as uuidv4 } from 'uuid'
import firebase from 'firebase'
import StockUser from "./interfaces/stocks/StockUser";
import util from 'util'
import { consoleTestResultsHandler } from "tslint/lib/test";
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

/**
 * Fetches user's stocks, calculates the total portfolio value &
 * @param user
 */
export async function CalculatePortforlio(user : User) : Promise<string> {

    const data = (await FirebaseApp.database().ref("stocks").orderByChild("ID").equalTo(user.id).once('value')).val()

    if(data  == null) {
        return `No data found`
    }
    let userStocks = (Object.values(data) as StockLot[]).sort((a,b) => {
        if (a.symbol === b.symbol){
            return 0;
        }
        else if(a.symbol > b.symbol ) {
            return 1;

        }
        return -1;
    })

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

        marketVal += userStocks[i].quantity * currentPrice
        costBasis += userStocks[i].priceBought * userStocks[i].quantity
        i++

    }

    const PnL = ((marketVal - costBasis) / costBasis)*100;

    return `portfolio value is ${formatNumber(marketVal)} ${formatPercentage(PnL)}`
}





export async function GetBalance(user : User) : Promise<number>{
    return (await FirebaseApp.database().ref(`users/${user.id}/Cash`).once('value')).val();
}



// #### PRIVATE FUNCTIONS ####
function initFirebase() : firebase.app.App {
    console.log(firebaseInit)
    return firebase.initializeApp(firebaseInit)
}

//refactor to a utils folder perhaps
function formatNumber( num : number) {
    return `$${num.toFixed(2)}`
}

function formatPercentage(num : number) {
    //(${(PnL >= 0) ? `+${PnL}` : PnL})
    let formatted = num.toFixed(2)
    return `(${num >= 0 ? `+${formatted}` : formatted }%)`
}


function initFinnhub() {
    
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = finnhubApiKey
    return new finnhub.DefaultApi()
}





 
