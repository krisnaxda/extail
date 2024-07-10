const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://amarta:krisna@cluster0.a5yqkia.mongodb.net/sepsana')


const urlSchema = {
    _id: {
        type: mongoose.SchemaTypes.ObjectId
    },
    ogLink: {
        type: String,
        required: true
    },
    shortLink: {
        type: String,
        required: true,
        unique: true
    },
    visit: {
        type: Number,
        default: 0
    },
}
const short = mongoose.model('shortener', urlSchema) 

module.exports = short;