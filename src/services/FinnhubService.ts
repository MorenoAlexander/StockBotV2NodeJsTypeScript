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

      const response = await axios.get<Quote>(
        FinnhubService.FINNHUB_URL + "quote",
        {
          params: { symbol: symbolCapital },
        }
      );

      return response.data;
    } catch (e) {
      logger.error(e);

      throw e;
    }
  }
}
