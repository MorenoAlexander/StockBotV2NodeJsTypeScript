import { Message, User } from "discord.js";
import { firebaseInit} from '../serverconfig.json'
import Quote from "./interfaces/stocks/quote";
import StockLot from "./interfaces/stocks/StockLot";
import {v4 as uuidv4 } from 'uuid'
import firebase from 'firebase'
import StockUser from "./interfaces/stocks/StockUser";

const FirebaseApp = initFirebase()

export async function BuyStock(user : User, quote : Quote, quotesymbol : string, orderCount : number)  : Promise<string>{
    try {
        var newStockLot = {ID : user.id, Date: new Date().toUTCString(), quantity: orderCount, priceBought: quote.c, symbol: quotesymbol, GUID: user.avatar } as StockLot;
        var userData = (await FirebaseApp.database().ref(`users/${user.id}`).once('value')).val() as StockUser;

        var  balance = userData.Cash;
        
        var cost = (newStockLot.priceBought * newStockLot.quantity)
        console.log(`${newStockLot.priceBought} * ${newStockLot.quantity} => cost: ${cost}`);
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


export async function GetBalance(user : User) : Promise<Number>{
    
    return (await FirebaseApp.database().ref(`users/${user.id}/Cash`).once('value')).val();
}


function initFirebase() : firebase.app.App {

    console.log(firebaseInit)
    return firebase.initializeApp(firebaseInit)
}

//refactor to a utils folder perhaps
function formatNumber( num : number) {
    return `$${num.toFixed(2)}`
}