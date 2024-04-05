var admin = require('firebase-admin')

var serviceAccount = require('../product-mgt-db-firebase-adminsdk-i2m47-38863f6e44.json');

const firestore = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = { firestore };
