const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
//const usersSession = require(path.join(__dirname, 'models', 'mongoose',  'usersSessions.js'));


const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7, // 1 week
    touchAfter: 3600, // update every hour
    //schema: sessionSchema // pass your custom schema here
    //model: usersSession // pass your custom model here
});

store.on('connected', function () {
    console.log('[SUBANESH] Sessions MongoDB connected!');
});

store.on('disconnected', function () {
    console.log('[SUBANESH] Sessions MongoDB disconnected!');
});

store.on('error', function (error) {
    console.log("[SUBANESH] Sessions store error :" + error);
    //assert.ifError(error);
    //assert.ok(false);
});

store.on('reconnectFailed', function () {
    console.log('[SUBANESH] Sessions MongoDB reconnect failed!');
});

const customMongodbSession = {
    secret: 'This is a secret',
    cookie: {
        'cookieName': "Subanesh's_server",
        'cookieValue': "Universal chat by Subanesh", //Custom cookies, can be set permanently | temp, for additional reference
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        path: "/",//if / the cookies will be sent for all paths
        httpOnly: false,// if true, the cookie cannot be accessed from within the client-side javascript code.
        //secure: true,// true->cookie has to be sent over HTTPS
        sameSite: null,//- `none` will set the `SameSite` attribute to `None` for an explicit cross-site cookie.

    },
    store: store,
    resave: false,
    saveUninitialized: false
};

module.exports = customMongodbSession;
