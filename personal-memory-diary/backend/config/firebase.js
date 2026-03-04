const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Ensure you have generated a service account key from the Firebase Console
// (Project Settings > Service Accounts > Generate new private key)
// Place the JSON file in the backend root directory (e.g., serviceAccountKey.json)
// and reference it in the .env file.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

let serviceAccount = null;
if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-bucket.appspot.com'
    });
    console.log('Firebase Admin initialized successfully.');
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found or invalid in .env. Firebase Admin not initialized.');
    // To allow the app to boot without config for development scaffolding
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
const storage = admin.apps.length ? admin.storage() : null;

module.exports = { admin, db, auth, storage };
