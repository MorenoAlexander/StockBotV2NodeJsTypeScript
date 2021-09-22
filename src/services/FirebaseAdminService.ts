import serverconfig from '../../serverconfig.json'
import { initializeApp, FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import * as firestore from 'firebase/firestore'
console.log('is this running?')

initializeApp(serverconfig.firebaseInit)
export function init(options: FirebaseOptions) {
  initializeApp(options)
}

export const database = getDatabase()

export const auth = getAuth()

export const firestorekit = {
  firestore: firestore.getFirestore(),
  kit: firestore,
}
