const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
}, { timestamps: true });

module.exports = new mongoose.model('users', usersSchema);
