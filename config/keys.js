require('dotenv').config();

module.exports = {
    // PORT: process.env.port || 5000,
    // mongoDB_URL: process.env.mongoDB_URL,
    database_connection_url: process.env.database_connection_url,
    cloudinary_api_key: process.env.cloudinary_api_key,
    cloudinary_api_secret: process.env.cloudinary_api_secret,
    cloudinary_name: process.env.cloudinary_name
}