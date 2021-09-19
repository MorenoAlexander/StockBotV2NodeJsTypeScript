import { job_convertFireBaseData } from './jobs/migrateFirebaseData'

Parse.Cloud.define('job_helloWorld', () => {
  console.log('Printing hello world to console!')
})


Parse.Cloud.define('job_migrateFireBaseData', job_convertFireBaseData)
