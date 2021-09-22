import { Request, Response } from 'express'
import Firebase from 'firebase/database'
import logger from '../utils/WinstonLogger'

export default function Register(app: any) {
  app.get('/api/stock/getusers', async (req: Request, res: Response) => {
    const data = (
      await Firebase.get(Firebase.ref(Firebase.getDatabase(), 'users'))
    ).val()

    logger.info(req.params)

    logger.info(data)

    res.send(JSON.stringify(data))
  })
}
