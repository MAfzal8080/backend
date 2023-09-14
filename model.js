const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const user = mongoose.model('person', userSchema)

module.exports = user