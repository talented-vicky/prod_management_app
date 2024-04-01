require('dotenv').config();

module.exports = {
    // PORT: process.env.port || 5000,
    database_connection_url: process.env.database_connection_url,
    cloudinary_api_key: process.env.cloudinary_api_key,
    cloudinary_api_secret: process.env.cloudinary_api_secret,
    cloudinary_name: process.env.cloudinary_name,
    sendgrid_api_key: process.env.sendgrid_api_key
}