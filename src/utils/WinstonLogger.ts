import axios from 'axios';
import Winston from 'winston';

async function SendToSlack(info: unknown) {
  try {
    await axios.post(
      `https://hooks.slack.com/services/${process.env.SLACK_URL}`,
      { text: JSON.stringify(info) },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    Winston.error(e);
  }
}

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new Winston.transports.File({
      filename: 'combined.log',
      log: (info: unknown, next) => {
        SendToSlack(info).then(() => next());
      },
    }),
  ],
});

export default logger;
