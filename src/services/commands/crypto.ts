import { Message } from 'discord.js'
import { formatNumber, formatPercentage } from '../../utils/formatFunc'
import ICrypto from '../../interfaces/crypto/crypto'
import { GetCryptoQuote } from '../CryptoDBService'

export = [
  {
    name: 'crypto',
    description: 'get a quote for a crpyto currency',
    async execute(message: Message, args: string[]) {
      try {
        if (args.length == 0) {
          await message.reply('PLEASE INCLUDE A CRYPTO SYMBOL')
          return
        }
        const SYMBOL = args[0].toUpperCase()

        GetCryptoQuote(SYMBOL).then((data: ICrypto) => {
          message.channel.send(
            `${SYMBOL}: $${data.c} ${formatPercentage(
              (((data.c as number) - (data.o as number)) / (data.o as number)) *
                100
            )}`
          )
        })
      } catch (e) {
        throw e
      }
    }
  }
]

//which is better? Not sure.
const asyncResponse = (action: string) => {
  return `Fetching your ${action}...`
}
