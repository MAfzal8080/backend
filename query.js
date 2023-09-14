const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type :String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default:Date.now()
    }
})

const query = mongoose.model('Query', querySchema);

module.exports = query;