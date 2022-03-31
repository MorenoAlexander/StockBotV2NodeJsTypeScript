import axios from 'axios';
import ICrypto from '../interfaces/crypto/crypto';
import Quote from '../interfaces/stocks/quote';
import logger from '../utils/WinstonLogger';

export default class FinnhubService {
  private static instance: FinnhubService;
  private static FINNHUB_URL: string = 'https://finnhub.io/api/v1/';
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    axios.defaults.headers = { 'X-Finnhub-Token': this.apiKey };
  }

  public static getInstance(apiKey: string = ''): FinnhubService {
    if (!FinnhubService.instance) {
      FinnhubService.instance = new FinnhubService(apiKey);
    } else if (apiKey === '') {
      throw new Error('instance is null and no api key provided');
    }
    return FinnhubService.instance;
  }

  public async Quote(symbol: string): Promise<Quote> {
    try {
      const symbolCapital = symbol.toUpperCase();
      return await this.SendRequest<Quote>('quote', { symbol: symbolCapital });
    } catch (e) {
      throw e;
    }
  }

  public async CryptoCandles(
    symbol: string,
    resolution: string = '1',
    from: number = new Date().getTime(),
    to: number = new Date().getTime() + 1000
  ) {
    try {
      const symbolCapital = 'BINANCE:' + symbol.toUpperCase() + 'USDT';
      return await this.SendRequest<ICrypto>('quote', {
        symbol: symbolCapital,
        resolution,
        from,
        to,
      });
    } catch (e) {
      throw e;
    }
  }

  private async SendRequest<T>(path: string, params: any): Promise<T> {
    try {
      const result = await axios.get(FinnhubService.FINNHUB_URL + path, {
        params,
      });

      return result.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
