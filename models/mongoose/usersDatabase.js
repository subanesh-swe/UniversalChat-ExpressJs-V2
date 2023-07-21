const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

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

usersSchema.pre("create", function (next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

usersSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

usersSchema.methods.comparePassword = function (plainPassword, callback) {
    console.log(`conpare: curr:${plainPassword} == pass${this.password}`)
    return callback(null, bcrypt.compareSync(plainPassword, this.password));
};

//module.exports = mongoose.model('users', usersSchema);
module.exports = new mongoose.model('users', usersSchema);
