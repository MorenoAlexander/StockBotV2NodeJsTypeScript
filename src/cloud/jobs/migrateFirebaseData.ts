import Firebase  from 'firebase-admin'
import logger from "../../utils/WinstonLogger"
const app = Firebase.app()

export async function job_convertFireBaseData(request: Parse.Cloud.FunctionRequest) {
  // get users

  logger.info('Hello World!')
  const firebaseUsers = Object.values((
    await app.database()
      .ref('stocks')
      .orderByChild('ID')
      .once('value')
  ).val())


  logger.info(JSON.stringify(firebaseUsers))
  return ''

}
