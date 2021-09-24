import { job_convertFireBaseData, job_migrateUserData, job_migrateWalletData } from './jobs/migrateFirebaseData'

Parse.Cloud.define('job_helloWorld', () => {
  console.log('Printing hello world to console!')
})


Parse.Cloud.define('job_migrateFireBaseData', job_convertFireBaseData)


Parse.Cloud.define('job_migrateUserData',job_migrateUserData)

Parse.Cloud.define('job_migrateWalletData', job_migrateWalletData)
