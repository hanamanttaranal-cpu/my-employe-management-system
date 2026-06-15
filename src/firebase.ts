import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { FirestoreErrorInfo, OperationType } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase using the configuration credentials injected by AI Studio
const app = initializeApp(firebaseConfig);

setLogLevel('silent');

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Validates connection to Firestore. Throws a console log on failure.
 */
async function testConnection() {
  try {
    // Tests connection against test collection path as mandated by the firebase-integration skill
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test completed.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore reports client is offline. Verify connection settings.");
    }
  }
}
testConnection();

/**
 * standard Error Handler as required by the Firebase Integration Skill.
 * Formats a Firebase Permission or Access error into a JSON specification and throws it.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Operation Failed with detailed trace:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
