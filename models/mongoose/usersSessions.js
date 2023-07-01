const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    _id: Object,
    session: Object
}, { timestamps: true });

module.exports = new mongoose.model('sessions', sessionSchema);

//{
//    "_id": "kRon7OrKOXFMLA3J0A_G13mcLYa9sKEk",
//        "expires": {
//        "$date": {
//            "$numberLong": "1688638207592"
//        }
//    },
//    "session": {
//        "cookie": {
//            "originalMaxAge": 604800000,
//                "expires": {
//                "$date": {
//                    "$numberLong": "1688638207592"
//                }
//            },
//            "secure": null,
//                "httpOnly": true,
//                    "domain": null,
//                        "path": "/",
//                            "sameSite": null
//        },
//        "name": "subanesh",
//            "userId": "05c8771b-ba39-416c-bb50-42f2a78d3a12"
//    }
//}

//const mongoose = require('mongoose');

//const sessionSchema = new mongoose.Schema({
//    _id: String,
//    session: {
//        cookie: Object,
//        deviceDetails: Object,
//        createdAt: {
//            type: Date,
//            default: Date.now
//        },
//        updatedAt: {
//            type: Date,
//            default: Date.now
//        }
//    }
//}, { timestamps: true });

//module.exports = new mongoose.model('sessions', sessionSchema);