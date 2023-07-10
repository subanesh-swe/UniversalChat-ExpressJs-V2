const mongoose = require('mongoose');

const participantSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

const iotDevicesSchema = mongoose.Schema({
    deviceId: {
        type: String,
        require: true
    },
    deviceName: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    participants: {
        type: [participantSchema],
        default: []
    },
}, { timestamps: true });

module.exports = new mongoose.model('iotDevices', iotDevicesSchema);
