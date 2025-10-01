
const admin = require("firebase-admin");

// IMPORTANT: Replace with the actual path to your service account key file
const serviceAccount = require("../../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "herromix@gmail.com";

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`Successfully set admin role for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin role:", error);
    process.exit(1);
  }
}

setAdmin();
