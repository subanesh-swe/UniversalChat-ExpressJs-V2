const { error } = require('console');
const express = require('express');
const bcrypt = require("bcrypt");
const session = require('express-session');
const path = require('path');
const roomsDatabase = require(path.join(__dirname, '..', 'models', 'mongoose', 'roomsDatabase.js'));
const socket = require('socket.io');

const app = express();
const router = express.Router();

router.use(function (req, res, next) {
    if (req.session && req.session.name) {
        console.log(`@/meggenger > Meggenger Router [ router.use All ] : Authentication verified, req[path]: '${req.path}'`);
        next();
    } else {
        if (req.method === 'GET') {
            console.log(`@/meggenger > Meggenger Router [ router.use GET ] : Authentication invalide, req[path]: '${req.path}', redir >>> @/users/login`);
            res.redirect('/users/login');
        } else {
            console.log(`@/meggenger > Meggenger Router [ router.use ALL ] : Authentication invalide, req[path]: '${req.path}', sending(report)`);
            return res.json({ result: true, redirect: "/users/login", alert: "Access Denied!!! either due to Illegal access to server or communication error, please Login!!!" });
        }
    }
});

router.get('/', function (req, res, next) {
    console.log(`@/meggenger [ Get ] : >>>>> redir > @/meggenger/rooms`);
    res.redirect('/meggenger/rooms')
});

router.get('/rooms', async (req, res, next) => {
    var roomListData;
    var roomListLabel;
    try {

        //roomListData = await roomsDatabase.find({ participants: { $in: [req.session.name] } });
        roomListData = await roomsDatabase.find({ participants: { $elemMatch: { username: req.session.name } } });
        //console.log(`rooms : ${roomListData}`);
        if (roomListData.length === 0) {
            roomListLabel = "You haven't joined any rooms yet. Please create a new room or join a room";
            console.log('No data found.');
        } else {
            roomListLabel = "List of rooms you have joined";
            console.log("data found");
        }
    } catch (err) {
        roomListData = [];
        roomListLabel = "Error while finding the rooms, If you have already joined any team please try again after something.";
        console.log(err);
    } finally {
        res.render("rooms", {
            title: "Rooms",
            userName: req.session.name,
            roomListLabel: roomListLabel,
            roomList: roomListData,
        });
    }
});

router.post('/rooms', async (req, res) => {
    try {
        //var temp = { sender: "subanesh-swe", message: "this is a reply from@/meggenger/rooms [post] " }; /* ------------------------------------------------ */
        //req.io.sockets.emit("chat", temp);
        //console.log("new msg ---------->>>>>" + temp.sender + "\n" + temp.message);

        console.log(`@/meggenger/rooms [post] : req.body : ${JSON.stringify(req.body)}`);
        var { formTitleSender, roomNameOrId, enabelPassword, password } = req.body;

        if (roomNameOrId == null || formTitleSender == null || (formTitleSender !== "Create new Room" && formTitleSender !== "Join new Room")) {
            // throw new Error("Input field invalid !!! either due to invalid access to server or communication error");
            return res.json({ result: false, alert: "Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });
        }

        let currRoomId;
        let data;
        let currPassword;

        if (enabelPassword != null) {  // enabelPassword === "on"
            currPassword = password;
        } else {
            currPassword = "";
        }

        if (formTitleSender === "Create new Room") {
            /**************************************************** Create new Room ****************************************/
            currRoomId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            //do {
            //    currRoomId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            //    data = await roomsDatabase.find({ roomId: currRoomId });
            //    console.log(`@/meggenger/rooms [post] : [Create room] mongodb data : ${data}`);
            //} while (data.length !== 0);

            const encryptedNewPassword = await bcrypt.hash(currPassword, 10);

            await roomsDatabase.create({
                roomId: currRoomId,
                roomName: roomNameOrId,
                password: encryptedNewPassword,
                //participants: [req.session.name]
                participants: [{
                    username: req.session.name,
                    userId: req.session.userId,
                    admin: true
                }]
            });
            return res.json({ result: true, redirect: `/meggenger/rooms/${currRoomId}`, alert: `New room '${roomNameOrId}' created with ID: '${currRoomId}', Password: '${password}' ` });


        } else if (formTitleSender === "Join new Room") {
            /**************************************************** Join new Room ****************************************/
            currRoomId = roomNameOrId;
            data = await roomsDatabase.findOne({ roomId: currRoomId });
            console.log(`@/meggenger/rooms [post] : [join room] mongodb data : ${data}`);
            if (data != null && data.length != 0) {

                const roomPassword = data.password;
                bcrypt.compare(currPassword, roomPassword, async (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.json({ result: false, alert: "Something went wrong. ensure you have entered a valid input, please try again after sometime or try contacting the admin!!!" });
                    } else if (result) {
                        // data.participants.push(req.session.name);
                        data.participants.push({
                            username: req.session.name,
                            userId: req.session.userId,
                            admin: false
                        });
                        await data.save();
                        return res.json({ result: true, redirect: `/meggenger/rooms/${currRoomId}`, alert: "Join successful!" });
                    } else {
                        return res.json({ result: false, alert: "Invalid Password!!!" });
                    }
                });
            } else {
                return res.json({ result: false, alert: "Invalid Room Id, there is no such room exist!!!" });
            }

        }

        //return res.json({ result: false, alert: "if- else end -->>> Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });

    } catch (error) {
        console.log(`Error @/meggenger/rooms [post] : ${error}`);
        return res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
});




router.get('/rooms/:roomId', async (req, res, next) => {
    try {
        const reqRoomId = req.params.roomId;
        if (reqRoomId == null) {
            return res.redirect('/meggenger/rooms');
        }
        const data = await roomsDatabase.findOne({ roomId: reqRoomId, participants: { $elemMatch: { username: req.session.name } } });
        console.log(`@/meggenger/rooms/meggenger/:roomId [get] : data : ${JSON.stringify(data)}`);
        if (data != null && data.length != 0) {
            console.log(`data.roomName : ${data.roomName}`)
            const plainData = data.toObject();

            delete plainData._id;
            delete plainData['updatedAt'];
            delete plainData.__v;

            res.render('chat', { title: "SWE's world", roomData: JSON.stringify(plainData), roomId: data.roomId, roomName: data.roomName, userName: req.session.name, userId: req.session.userId });
        } else {
            return res.redirect('/meggenger/rooms');
        }
    } catch (error) {
        console.log(`Error @/meggenger/rooms/:roomId [get] : ${error}`);
    }
});

router.get('/rooms/meggenger_v2', function (req, res, next) {
    res.render('chat_v2', { title: "SWE's world", name: req.session.name });
});

router.get('/rooms/meggenger_v3', function (req, res, next) {
    res.render('chat_v3', { title: "SWE's world", name: req.session.name });
});

router.get('/rooms/meggenger_v4', function (req, res, next) {
    res.render('chat_v4', { title: "SWE's world", name: req.session.name });
});


module.exports = router;
