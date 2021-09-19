import { Request, Response } from 'express'
import Firebase from 'firebase-admin'
import logger from '../utils/WinstonLogger'

const FirebaseApp = Firebase.app()

export default function Register(app: any) {
  app.get('/api/stock/getusers', async (req: Request, res: Response) => {
    const data = await FirebaseApp.database()
      .ref()
      .child('users')
      .once('value')

    logger.info(req.params)

    logger.info(data)

    res.send(JSON.stringify(data))
  })
}
