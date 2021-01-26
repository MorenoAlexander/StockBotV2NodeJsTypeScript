
import fs from 'fs';
import {Manager} from './interfaces/common/Manager';
import Discord, { ClientOptions, Client } from 'discord.js';
import logger from './WinstonLogger'
//Initializer
import {prefix} from '../serverconfig.json'




export class DiscordManager extends Discord.Client implements Manager {
    commands : any;
    
    app : any
    

    public constructor(options : ClientOptions = {} ) {
        super(options);
        this.commands = null;

        this.on('ready', () => {
            logger.info(`Discord client established as ${(this.user.tag != null) ? this.user.tag : "No user" }` )

        })

        // commands
        this.collectCommands();
    }

    collectCommands() {
        // Set up commands
        this.commands = null;
        this.commands = new Discord.Collection();

        const commandFiles = fs.readdirSync(__dirname+'/commands').filter( file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const commands = require(__dirname+`/commands/${file}`)

            for (const cmd of commands) {
                this.commands.set(cmd.name, cmd);
            }
        }
    }

    logIn(apiKey : string) {
        this.login(apiKey).then((success : any) => {
            logger.info(`Discord client connection successfully established: ${success}`);
        },(rejected : any) => {
            logger.error(rejected);
        })
    }

    setUp(app : any) {
        this.app = app;

        this.app.get('/tests', (req : any, res :any) => {

            res.send("<h1>DISCORD REGISTERED</h1>")

        });
        this.app.post('api/discord/gift', (req: any, res: any) => {})

        this.on('message', (message) => {

            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);

            const command = args.shift().toLowerCase(); //tslint-disable-line

            try {
                if(!this.commands.has(command)) {
                    message.channel.send("No such command exists. Sorry!");
                    return;
                }
                this.commands.get(command).execute(message, args);
            }
            catch(error) {
                logger.error(error)
                message.reply("An error occurred while attempting to execute command. Sumting Wong!")
            }
        })

        return true;
    }
}
