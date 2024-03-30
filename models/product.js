const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String, 
            required: true
        },
        location: {
            type: { type: String }, 
            coordinates: []
            // coordinates: [ Number ]
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
    },
    {
        timestamps: true
    }
)

productSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('Product', productSchema);