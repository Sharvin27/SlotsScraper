const admin = require("firebase-admin");
const fs = require("fs");

let firebaseConfig;

if (process.env.FIREBASE_KEY) {
    firebaseConfig = JSON.parse(process.env.FIREBASE_KEY);
} else {
    firebaseConfig = JSON.parse(fs.readFileSync("./firebase-key.json", "utf8"));
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
});

module.exports = admin;
