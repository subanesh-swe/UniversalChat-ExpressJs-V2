const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const server = require('http').Server(app)
const socketIo = require('socket.io')(server)

// Subanesh's ENV's 
require('dotenv').config();

const session = require('express-session');
const DeviceDetector = require('node-device-detector');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const messengerRouter = require('./routes/messenger');


// view engine setup
const viewsPaths = [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views', 'index'),
    path.join(__dirname, 'views', 'messenger'),
    path.join(__dirname, 'views', 'users'),
];
app.set('views', viewsPaths);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false })); //Good for ejs (js var rendering)
app.use(express.urlencoded({ extended: true }));

/* Session and Cookies */
const customMongodbSession = require(path.join(__dirname, 'models', 'session', 'mongodbSession.js'));
//const MongodbSessionDatabase = require(path.join(__dirname, 'models', 'mongoose', 'usersSessions.js'));
app.use(session(customMongodbSession));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use(express.static(path.join(__dirname, 'public', 'scripts')));
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));


/* MongoDB connection */
var mongooseRetryCount = 0;
const mongooseMaximumRetryCount = 10;
const mongooseRetryTimeout = 5000;

function mongooseConnectWithRetry() {
    console.log('[SUBANESH] Requestion MongoDB connection...');

    mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 50,
        wtimeoutMS: 2500,
        useNewUrlParser: true
    })
        .catch((err) => {
            console.log(`[SUBANESH] Error in MongoDB connection...`);
            console.error(err.stack)
            mongooseRetryCount++;
            if (mongooseRetryCount < mongooseMaximumRetryCount) {
                console.log(`[SUBANESH] Retrying count: ${mongooseRetryCount}, Requestion MongoDB connection in ${mongooseRetryTimeout} Seconds...`);
                setTimeout(mongooseConnectWithRetry, mongooseRetryTimeout);
            } else {
                console.log(`[SUBANESH] Retrying count: ${mongooseRetryCount}, Maximum retries reached. Exiting...`);
                mongooseRetryCount = 0;
                process.exit(1);
            }
        });
}

mongooseConnectWithRetry();
mongoose.connection.on('connected', () => { console.log('[SUBANESH] MongoDB connected...'); });
mongoose.connection.on('disconnected', () => { console.log('[SUBANESH] MongoDB disconnected...'); });
//mongoose.connection.on('error', (err) => {
//    console.log(`MongoDB connection error: ${err}`);
//    mongooseConnectWithRetry();
//});

/* socket connection */ //-------------------------------------------//
//const io = socket(4000, {
//    cors: {
//        origin: ['http://localhost:3000']
//    }
//});

socketIo.on('connection', socket => {

    const { userId: UserId } = socket.handshake.query;
    socket.join(UserId);

    console.log(`Socket ---> Connected <---   UserId: ${UserId}, SocketId: ${socket.id}, Query:${JSON.stringify(socket.handshake.query)}`);

    socket.on("disconnect", () => {
        console.log(`Socket --> Disconnected <--  UserId: ${UserId}, SocketId: ${socket.id}`);
    });

    socket.on('sendMessage', (receivedData) => {
        const { recipientIds, roomId, data } = receivedData;
        console.log(`Received message by UserId: ${UserId}, SocketId: ${socket.id} ==> roomId:'${roomId}', recipientIds:'${recipientIds}', data:'${JSON.stringify(data)}' `);

        recipientIds.forEach(recipientId => {
            socket.broadcast.to(recipientId).emit('receiveMessage', receivedData);
            console.log(`Sending message by UserId: ${UserId}, SocketId: ${socket.id} ==> roomId:'${roomId}', recipientId:'${recipientId}', data:'${JSON.stringify(data)}' `);
        })
    })
})

app.use('/users/login', (req, res, next) => {
    const detector = new DeviceDetector({
        clientIndexes: true,
        deviceIndexes: true,
        deviceAliasCode: false,
    });

    const userAgent = req.headers['user-agent'];
    const result = detector.detect(userAgent);

    req.session.deviceDetails = result;
    req.session.updateAt = Date.now();
    //console.log("in update of sessions-----------------------------------");
    next();
});

app.all('/', function (req, res, next) {
    //res.redirect('/index/rooms');
    if (req.method === 'GET') {
        console.log(`@/ > Main Router [ router.use GET ] :  req[path]: ${req.path}, redir >>> @/users/login`);
        res.redirect('/users/login');
    } else {
        console.log(`@/ > Main Router [ router.use ALL ] :  req[path]: ${req.path}, sending(report)`);
        return res.json({ result: true, redirect: "/users/login", alert: "Access Denied!!! either due to Illegal access to server or communication error, please Login!!!" });
    }
})

//app.get('/messenger/rooms/:room', function (req, res, next) {
//    res.render('chat', { title: "SWE's world", roomData: {}, roomId: "", roomName: "", userName: "subanesh", userId: "" });
//})

app.use('/', indexRouter);
app.use('/messenger', messengerRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    });
});

module.exports = {server, app};
