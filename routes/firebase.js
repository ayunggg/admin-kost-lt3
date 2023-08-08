var admin = require("firebase-admin")

var serviceAccount = require("../key.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://admin-kost-lt3.appspot.com",
})

module.exports = admin
