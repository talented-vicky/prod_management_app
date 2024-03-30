const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true
        },
        email: {
            type: String, 
            required: true
        },
        password: {
            type: String, 
            required: true
        },
        address: {
            type: { type: String }, 
            coordinates: []
        },
        token: String,
        tokenExp: Date,
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
    },
    {
        timestamps: true
    }
)

userSchema.index({ "address": "2dsphere" })
module.exports = mongoose.model('User', userSchema)