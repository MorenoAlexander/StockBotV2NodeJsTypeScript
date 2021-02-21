import axios from "axios";
import Quote from "../interfaces/stocks/quote";
import logger from "../utils/WinstonLogger";


export default class FinnhubService {
  private static instance: FinnhubService;
  private static FINNHUB_URL: string = "https://finnhub.io/api/v1/";
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    axios.defaults.headers = {'X-Finnhub-Token': this.apiKey}

  }

  public static getInstance(apiKey: string): FinnhubService {
    if (!FinnhubService.instance) {
      FinnhubService.instance = new FinnhubService(apiKey);
    }

    return FinnhubService.instance;
  }

  public async Quote(symbol: string): Promise<Quote> {
    try {
      let symbolCapital = symbol.toUpperCase();
      return await this.SendRequest<Quote>('quote', {symbol: symbolCapital})
    } catch (e) {
      throw e;
    }
  }


  private async SendRequest<T>(path : string, params : any) : Promise<T>{
    try {
      let result = await axios.get(FinnhubService.FINNHUB_URL+path,{
        params: params
      })

      return result.data;
    }
    catch(error) {
      logger.error(error)
      throw error;
    }
  }
}
