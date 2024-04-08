// const crypto = require('crypto')
// const fs = require('fs')
// const path = require('path')
// const { promisify } = require('util')

// var admin = require('firebase-admin');

// let encryptedFilePath;

// // Promisify functions for asynchronous file operations
// const readFileAsync = promisify(fs.readFile);
// const writeFileAsync = promisify(fs.writeFile);

// const randomKey = (length) => {
//   return crypto.randomBytes(length / 2).toString('hex')
// }

// // Function to encrypt data using AES
// async function encryptData(data, key) {
//     const iv = crypto.randomBytes(16); // Generate initialization vector
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv);
//     let encryptedData = cipher.update(data, 'utf8', 'hex');
//     encryptedData += cipher.final('hex');
//     return iv.toString('hex') + encryptedData;
// }

// // Function to decrypt data using AES
// async function decryptData(data, key) {
//     const iv = Buffer.from(data.slice(0, 32), 'hex');
//     const encryptedData = data.slice(32);
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv);
//     let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
//     decryptedData += decipher.final('utf8');
//     return decryptedData;
// }


// // Encrypt Firebase Admin SDK JSON file
// async function encryptFirebaseAdminSDKJSON(filePath, key) {
//   try {
//     // Check if the file has already been encrypted
//     if (encryptedFilePath) {
//       console.log('File already encrypted:', encryptedFilePath);
//       return encryptedFilePath;
//     }

//     // Read JSON file
//     const jsonData = await readFileAsync(filePath, 'utf8');
    
//     // Encrypt JSON data
//     const encryptedData = await encryptData(jsonData, key);

//     // Write encrypted data to a new file
//     const encryptedFileName = 'encrypted-firebase-admin-sdk.json';
//     encryptedFilePath = path.join(__dirname, '..', encryptedFileName);
//     await writeFileAsync(encryptedFilePath, encryptedData, 'utf8');
    
//     console.log('File encrypted successfully:', encryptedFilePath);
//     return encryptedFilePath;

//   } catch (error) {
//       console.error('Error encrypting file:', error);
//   }
// }

// // Decrypt Firebase Admin SDK JSON file during runtime
// async function decryptFirebaseAdminSDKJSON(key) {
//   try {
//     if (!encryptedFilePath) {
//       throw new Error('File has not been encrypted yet.');
//     }

//     // Read encrypted file
//     const encryptedData = await readFileAsync(encryptedFilePath, 'utf8');

//     // Decrypt encrypted data
//     const decryptedData = await decryptData(encryptedData, key);

//     // Parse JSON data
//     const jsonData = JSON.parse(decryptedData);

//     console.log('Firebase Admin SDK JSON file decrypted successfully.');
//     console.log('Decrypted data:', jsonData);
//     return jsonData;

//   } catch (error) {
//       console.error('Error decrypting file:', error);
//   }
// }

// // Example usage
// const firebaseAdminSDKFilePath = path.join(__dirname, '../product-mgt-db-firebase-adminsdk-i2m47-38863f6e44.json')
// const encryptionKey = randomKey(32)

// // Encrypt Firebase Admin SDK JSON file
// const file1 = async () => {
//   const encryptedFile = await encryptFirebaseAdminSDKJSON(firebaseAdminSDKFilePath, encryptionKey);
// }
// file1()

// const file2 = async () => {
//   const serviceAccount = await decryptFirebaseAdminSDKJSON(encryptionKey)
//   return serviceAccount

// }
// const serviceAccount = file2()
// console.log(serviceAccount)
// return

// const firestore = () => {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// module.exports = { firestore };


// {
//   "type": "service_account",
//   "project_id": "product-mgt-db",
//   "private_key_id": "38863f6e44d0ea8f97a37e9c7ea875e698ce2c19",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDNt4WUHPpVZwZ7\nlIztqQ56KG8riPcfErz5R0ewUuhTfkLBFKZEZvsN0N8VWcoFdAFSQESnVUfNw1lI\nV76RBwN2z6+Mnmyyukl8nLazdauKVFXt+cXq2pZKIIPbol6YTkWcmQtRSaST+wlu\nc6VDNGEpnbVo4Le05wuE+AFRpxqT5iFGr4NytYsrprLccSkrqOLj3qFG2CegH+9v\nx66q1F0Q466UhDzW9slJcyncmML9TjmZUcDy2/JVZVkTI3ojeCmVYDo2fTBEkK1W\nLn9SGN90ra1FYMBWJJZDYwKGfDYTwqAXdNuvtDawaH0SLfL3z9ENptqcNnc1BR0v\nnwEB8uLVAgMBAAECggEAP+Kk9JzVLy16CWnWJD5SlSQ2dgYofHlkv2NgA4WTyc4V\nrAGeKvLyN1Ws2eQTBYODn4f+6hplXKS0du9s6nwLmtufkGNorU6F4NGIOY4q8iAD\nuY5OZQNyFd4oJM61YsY3/wxWQ+3DUwNsZ+U5Jvg+zl5ARqw20NLJtIcSXcmvysrn\nl+Sq6lWbp1iCDgZzfR1N6Ve6UJMPZ1kwv3ATfhuWbeyPwPtmwrfqvk1sOQM9/2r+\nKEI5q9s3D1bHtVOzRYzVoZMUvqZAbmNkX9nf8AtX/O25kj3uNh/ns4d7RyvU0ku/\nwefNY23dVJQm8+B5wnQSSqBtp/tczxvmdW66PhCINwKBgQD2bqNGHovji57LUYK6\nRn8blBFDV3vKrcnJsoA1d7XJCiS+gupKYMziKjouYoS6KUbsmIkaV9tLkYsml/Gi\nelxZriSZF/7N3YrBJY88EqE+jI3Jdbb8n6+GwIm2YzPRY/948tjcjELU4iVxOjsw\nNfcPoZ3pEXg9cg5DizXFtioTuwKBgQDVtDPgT+k0JO5lm74Bq604t0UFu2uVRf/8\nHB8xOWuQM9Bk67HWKKw7wjXP8bRmx6bOLD5KUUHiMmYXsCaIhWDtedsHvhzJzPdc\nI91VP51c8VXjeNQqo+vyV8Wop9gc9qV/thIIuF+HuUZ0YA2Bv0OUfWPmZhIeiUPS\nf/aL9QDSrwKBgQCpZaBCwRi0D/PWG2/bkD4rvPqo6egkiJYfWd6b4nBJg/mCJAfd\nnPD5vsFDxWErfthMJwaH30DVj3Sx0Ny/LZFx7C0oN8BlzxZkcuclCkFg98k3ZP2m\nZjaIUK3ZfBPQqgahI35DDP+byuCmFrs9BruQOS6NWf7nbhG0CGusPu5ppQKBgQCl\ntT/slcpc9q4s9+ET5o1BR0ssMLIxY8AlO6EsSDwR6zuSpfiV+Z/kDqovflrGv9Wm\nVURP2EZgIXhssdiPT+1i93RRwqcMC/Va6yx7KALbyP8yjcTm84jHuCu6pbu8abzX\nFNVTEbRxx8bMApc2nprGj5xhUZCHQSToGvWQfQCQXQKBgQD1RbmssSGBEz8o3rME\nV0D5NICRcg/ls58SEqDo265nebDFecbtAmx3TFYDkLiiSlGNl6agg2gAUzsDZ4AC\ntd4PDqwfn5hNtdHBQSVGX8wp3U4kF1oC50uT2MgGdRq/n3EhESBVKxNkMxQ1xG2W\nh6fUlSBN3WinjjBO69zZqQ1tNQ==\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-i2m47@product-mgt-db.iam.gserviceaccount.com",
//   "client_id": "101314081596489062731",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-i2m47%40product-mgt-db.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }
