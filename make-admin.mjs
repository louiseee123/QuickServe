
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { createInterface } from 'readline';

// --- Configuration ---
// 1. Download your service account key from:
//    Firebase Console > Project Settings > Service accounts > Generate new private key
// 2. Save the downloaded file as 'service-account-key.json' in your project root.
const SERVICE_ACCOUNT_FILE = './service-account-key.json';

// 3. Replace this with your Realtime Database URL from the Firebase Console.
//    It looks like: https://<your-project-id>-default-rtdb.firebaseio.com
const DATABASE_URL = 'https://quickserve-capstone-default-rtdb.firebaseio.com';


// --- Script Logic ---

async function makeAdmin(uid) {
  try {
    const serviceAccount = JSON.parse(
      await readFile(new URL(SERVICE_ACCOUNT_FILE, import.meta.url))
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: DATABASE_URL,
    });

    const firestore = admin.firestore();
    const auth = admin.auth();

    console.log(`\nAttempting to make UID: ${uid} an admin...`);

    // Set a custom claim in Firebase Auth. This is used for security rules.
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Successfully set custom claim { admin: true } for user ${uid} in Firebase Auth.`);

    // Update the user's role in the Firestore 'users' collection.
    await firestore.collection('users').doc(uid).update({
      role: 'admin'
    });
    console.log(`✅ Successfully updated user ${uid} role to 'admin' in Firestore.`);

    console.log('\n✨ Admin setup complete! You can now log in with your admin account.');

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`\n❌ Error: Service account key file not found at '${SERVICE_ACCOUNT_FILE}'.`);
      console.error("Please follow the configuration steps at the top of the script.");
    } else if (error.code === 'auth/user-not-found') {
        console.error(`\n❌ Error: User with UID '${uid}' not found in Firebase Authentication.`);
        console.error("Please make sure the UID is correct and the user exists.");
    }
    else {
      console.error('\n❌ An unexpected error occurred:', error.message);
    }
    process.exit(1);
  }
}

const uidFromArgs = process.argv[2];

if (uidFromArgs) {
  await makeAdmin(uidFromArgs);
  process.exit(0);
} else {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('? Please enter the User UID to make admin: ', async (uid) => {
    if (!uid) {
      console.error("\n❌ Error: UID cannot be empty.");
    } else {
      await makeAdmin(uid);
    }
    rl.close();
  });
}
