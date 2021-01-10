import { Message } from "discord.js";

export = [
    {
        name: 'ping',
        description: 'Pong!',
        execute(message : any, args : any) {
            message.channel.send('Pong.');
        }
    },
    {
        name: 'pong',
        description: 'Ping!',
        execute(message : Message, args : any ) {
            message.channel.send('Ping!');

        }
    }
]
