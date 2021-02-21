import express from 'express'
import firebase from 'firebase-admin'
import logger from '../utils/WinstonLogger'

const firebaseApp = firebase.app()

export default (app: any) => {
  app.post(
    'api/auth/login',
    async (req: express.Request, res: express.Response) => {}
  )

  app.post(
    '/api/auth/signup',
    async (req: express.Request, res: express.Response) => {
      try {
        const { email, desiredPassword } = req.body

        return 'reee'
      } catch (err) {
        logger.error(err)
      }
    }
  )
}
