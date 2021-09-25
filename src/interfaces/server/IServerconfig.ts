import { AppOptions } from 'firebase-admin'
import IParseConfig from './IParseConfig'

export default interface IServerConfig {
  version: string
  date: string
  DiscordKey: string
  finnhubApiKey: string
  port: number
  prefix: string
  slackUrl: string

  firebaseInit: AppOptions

  parseConfig: IParseConfig
}
