import axios from 'axios';
import Winston from 'winston';

async function SendToSlack(info: any) {
  try {
    await axios.post(
      'https://hooks.slack.com/services/' + process.env.SLACK_URL,
      { text: JSON.stringify(info) },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.log(e.message, e.config.url);
  }
}

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new Winston.transports.File({
      filename: 'combined.log',
      log: (info: any, next) => {
        console.log(info);
        SendToSlack(info).then(() => next());
      },
    }),
  ],
});

export default logger;
