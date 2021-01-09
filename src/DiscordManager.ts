
import fs from 'fs';
import {Manager} from './interfaces/common/Manager';
import Discord, { ClientOptions, Client } from 'discord.js';

//Initializer
import {prefix} from '../serverconfig.json'
import { isThrowStatement } from 'typescript';




export class DiscordManager implements Manager {
    DiscordClient : Discord.Client
    
    app : any
    

    public constructor(options : ClientOptions = {} ) {
        this.DiscordClient = new Discord.Client(options);

        this.DiscordClient.on('ready', () => {
            console.log(`Discord client established as ${(this.DiscordClient.user.tag != null) ? this.DiscordClient.user.tag : "No user" }` )

        })

        this.DiscordClient.commands = new Discord.Collection();

        console.log()

        //Set up commands
        const commandFiles = fs.readdirSync(__dirname+'/commands').filter( file => file.endsWith('.js'));
        console.log(commandFiles);

        for(const file of commandFiles) {
            const command = require(__dirname+`/commands/${file}`)
            this.DiscordClient.commands.set(command.name, command);
        }


        this.DiscordClient.on('message', (message) => {

            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);

            const command = args.shift().toLowerCase();
            

            try {
                this.DiscordClient.commands.get(command).execute(message, args);
            }
            catch(error) {
                console.log(error)
                message.reply("An error occurred while attempting to execute command. Sumting Wong!")
            }
        })


    }


    logIn(apiKey : string) {
        this.DiscordClient.login(apiKey).then((success) => {
            console.log(`Discord client connection successfully established: ${success}`);
        },(rejected) => {
            console.log(rejected);
        })
    }




    setUp(app : any) {
        this.app = app;

        this.app.get('/tests', (req : any, res :any) => {

            res.send("<h1>DISCORD REGISTERED</h1>")

            

        });
        this.app.post('api/discord/gift', (req: any, res: any) => {
            console.log(req);
        })

        


        return true;
    }


    private messageHandler(message : string ) {

    }
}
