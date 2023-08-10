const { error } = require('console');
const express = require('express');
const bcrypt = require("bcrypt");
const session = require('express-session');
const path = require('path');
const iotDevicesDatabase = require(path.join(__dirname, '..', 'models', 'mongoose', 'iotDevicesDatabase.js'));
const socket = require('socket.io');

const app = express();
const router = express.Router();

router.use(function (req, res, next) {
    if (req.session && req.session.name) {
        console.log(`@/iot > IoT Router [ router.use All ] : Authentication verified, req[path]: '${req.path}'`);
        next();
    } else {
        if (req.method === 'GET') {
            console.log(`@/iot > IoT Router [ router.use GET ] : Authentication invalide, req[path]: '${req.path}', redir >>> @/users/login`);
            res.redirect('/users/login');
        } else {
            console.log(`@/iot > IoT Router [ router.use ALL ] : Authentication invalide, req[path]: '${req.path}', sending(report)`);
            return res.json({ result: true, redirect: "/users/login", alert: "Access Denied!!! either due to Illegal access to server or communication error, please Login!!!" });
        }
    }
});

router.get('/', function (req, res, next) {
    console.log(`@/iot [ Get ] : >>>>> redir > @/iot/devices`);
    res.redirect('/iot/devices')
});

router.get('/devices', async (req, res, next) => {
    var deviceListData;
    var deviceListLabel;
    try {

        //deviceListData = await iotDevicesDatabase.find({ participants: { $in: [req.session.name] } });
        deviceListData = await iotDevicesDatabase.find({ participants: { $elemMatch: { username: req.session.name } } });
        //console.log(`devices : ${deviceListData}`);
        if (deviceListData.length === 0) {
            deviceListLabel = "You haven't created any devices yet. Please create a new device or join a device";
            console.log('No data found.');
        } else {
            deviceListLabel = "List of devices you have created";
            console.log("data found");
        }
    } catch (err) {
        deviceListData = []; 
        deviceListLabel = "Error while finding the devices, If you have already created any team please try again after something.";
        console.log(err);
    } finally {
        res.render("devices", {
            title: "Devices",
            userName: req.session.name,
            deviceListLabel: deviceListLabel,
            deviceList: deviceListData,
        });
    }
});

router.post('/devices', async (req, res) => {
    try {
        //var temp = { sender: "subanesh-swe", message: "this is a reply from@/iot/devices [post] " }; /* ------------------------------------------------ */
        //req.io.sockets.emit("chat", temp);
        //console.log("new msg ---------->>>>>" + temp.sender + "\n" + temp.message);

        console.log(`@/iot/devices [post] : req.body : ${JSON.stringify(req.body)}`);
        var { formTitleSender, deviceNameOrId, enabelPassword, password } = req.body;

        if (deviceNameOrId == null || formTitleSender == null || (formTitleSender !== "Create new Device" && formTitleSender !== "Join new Device")) {
            // throw new Error("Input field invalid !!! either due to invalid access to server or communication error");
            return res.json({ result: false, alert: "Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });
        }

        let currDeviceId;
        let data;
        let currPassword;

        if (enabelPassword != null) {  // enabelPassword === "on"
            currPassword = password;
        } else {
            currPassword = "";
        }

        if (formTitleSender === "Create new Device") {
            /**************************************************** Create new Device ****************************************/
            currDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            //do {
            //    currDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            //    data = await iotDevicesDatabase.find({ deviceId: currDeviceId });
            //    console.log(`@/iot/devices [post] : [Create device] mongodb data : ${data}`);
            //} while (data.length !== 0);

            const encryptedNewPassword = await bcrypt.hash(currPassword, 10);

            await iotDevicesDatabase.create({
                deviceId: currDeviceId,
                deviceName: deviceNameOrId,
                password: encryptedNewPassword,
                //participants: [req.session.name]
                participants: [{
                    username: req.session.name,
                    userId: req.session.userId,
                    admin: true
                }]
            });
            return res.json({ result: true, redirect: `/iot/devices/${currDeviceId}`, alert: `New device '${deviceNameOrId}' created with ID: '${currDeviceId}', Password: '${password}' ` });


        } else if (formTitleSender === "Join new Device") {
            /**************************************************** Join new Device ****************************************/
            currDeviceId = deviceNameOrId;
            data = await iotDevicesDatabase.findOne({ deviceId: currDeviceId });
            console.log(`@/iot/devices [post] : [join device] mongodb data : ${data}`);
            if (data != null && data.length != 0) {

                const devicePassword = data.password;
                bcrypt.compare(currPassword, devicePassword, async (err, result) => {
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
                        return res.json({ result: true, redirect: `/iot/devices/${currDeviceId}`, alert: "Join successful!" });
                    } else {
                        return res.json({ result: false, alert: "Invalid Password!!!" });
                    }
                });
            } else {
                return res.json({ result: false, alert: "Invalid Device Id, there is no such device exist!!!" });
            }

        }

        //return res.json({ result: false, alert: "if- else end -->>> Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });

    } catch (error) {
        console.log(`Error @/iot/devices [post] : ${error}`);
        return res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
});




router.get('/devices/:deviceId', async (req, res, next) => {
    try {
        const reqDeviceId = req.params.deviceId;
        if (reqDeviceId == null) {
            return res.redirect('/iot/devices');
        }
        const data = await iotDevicesDatabase.findOne({ deviceId: reqDeviceId, participants: { $elemMatch: { username: req.session.name } } });
        console.log(`@/iot/devices/iot/:deviceId [get] : data : ${JSON.stringify(data)}`);
        if (data != null && data.length != 0) {
            console.log(`data.deviceName : ${data.deviceName}`)
            const plainData = data.toObject();

            delete plainData._id;
            delete plainData['updatedAt'];
            delete plainData.__v;

            res.render('device', { title: "SWE's world", deviceData: JSON.stringify(plainData), deviceId: data.deviceId, deviceName: data.deviceName, userName: req.session.name, userId: req.session.userId });
        } else {
            return res.redirect('/iot/devices');
        }
    } catch (error) {
        console.log(`Error @/iot/devices/:deviceId [get] : ${error}`);
    }
});

module.exports = router;
