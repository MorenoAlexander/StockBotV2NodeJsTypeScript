import Winston from 'winston'
import axios from 'axios'
import { slackUrl } from '../../serverconfig.json'

async function SendToSlack(info: any) {
  axios.post(
    'https://hooks.slack.com/services/' + slackUrl,
    { text: JSON.stringify(info) },
    { headers: { 'Content-Type': 'application/json' } }
  )
}

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new Winston.transports.File({
      filename: 'combined.log',
      log: (info: any, next) => {
        console.log(info)
        SendToSlack(info).then(() => next())
      },
    }),
  ],
})

export default logger
