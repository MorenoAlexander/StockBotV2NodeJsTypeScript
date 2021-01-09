

export = [
    {
        name: 'ping',
        description: 'Ping!',
        execute(message : any, args : any) {
            message.channel.send('Pong.');
        }
    },
    {
        name: 'pong',
        description: 'Pong',
        execute(message : any, args : any) {
            message.channel.send('Ping!');
        }
    }
   

]

