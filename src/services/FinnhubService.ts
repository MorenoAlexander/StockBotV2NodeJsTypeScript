import axios from 'axios';
import ICrypto from '../interfaces/crypto/crypto';
import Quote from '../interfaces/stocks/quote';
import logger from '../utils/WinstonLogger';

export default class FinnhubService {
  // eslint-disable-next-line no-use-before-define
  private static instance: FinnhubService | null = null;

  private readonly FINNHUB_URL: string = 'https://finnhub.io/api/v1/';

  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    axios.defaults.headers = { 'X-Finnhub-Token': this.apiKey };
  }

  public static getInstance(apiKey = ''): FinnhubService {
    if (!FinnhubService.instance) {
      FinnhubService.instance = new FinnhubService(apiKey);
    } else if (apiKey === '') {
      throw new Error('instance is null and no api key provided');
    }
    return FinnhubService.instance;
  }

  public async Quote(symbol: string): Promise<Quote> {
    const symbolCapital = symbol.toUpperCase();
    return this.SendRequest<Quote>('quote', { symbol: symbolCapital });
  }

  public async CryptoCandles(
    symbol: string,
    resolution = '1',
    from: number = new Date().getTime(),
    to: number = new Date().getTime() + 1000
  ) {
    const symbolCapital = `BINANCE: ${symbol.toUpperCase()} USDT`;
    return this.SendRequest<ICrypto>('quote', {
      symbol: symbolCapital,
      resolution,
      from,
      to,
    });
  }

  private async SendRequest<T>(path: string, params: any): Promise<T> {
    try {
      const result = await axios.get(this.FINNHUB_URL + path, {
        params,
      });

      return result.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
