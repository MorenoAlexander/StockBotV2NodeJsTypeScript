import { Message, User } from 'discord.js'
import { finnhubApiKey } from '../../serverconfig.json'
import ICrypto from '../interfaces/crypto/crypto'

import FinnhubService from './FinnhubService'

const finnhubClient = FinnhubService.getInstance(finnhubApiKey)

export const GetCryptoQuote = async (SYMBOL: string): Promise<ICrypto> => {
  return await finnhubClient.CryptoCandles(SYMBOL)
}
