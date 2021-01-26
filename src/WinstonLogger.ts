import Winston from 'winston'


const logger = Winston.createLogger({
    level: 'info',
    format: Winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        new Winston.transports.File({filename: 'error.log', level: 'error'}),
        new Winston.transports.File({filename: 'combined.log'}),
    ],
});

export default logger;