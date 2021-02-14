
import {version,date} from '../../../serverconfig.json'
export =     [
    {
        name: 'version',
        description: 'returns the current version of Stock Bot',
        execute(message : any, args : any) {
            return message.channel.send(`VERSION: ${version}, DATE: ${date}`)
        }
    }
]