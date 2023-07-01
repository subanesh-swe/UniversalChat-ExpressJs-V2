const express = require("express");
const bcrypt = require("bcrypt");
const { randomUUID } = require('crypto');
const path = require('path');
const usersDatabase = require(path.join(__dirname, '..', 'models', 'mongoose', 'usersDatabase.js'));
const session = require("express-session");
const createError = require('http-errors');
const { create } = require("domain");


const router = express.Router();

router.use(function (req, res, next) {
    if (req.session && req.session.name) {
        if (req.path === '/logout') {
            next();
        } else if (req.method === 'GET') {
            console.log(`@/users > Users Router [ router.use GET ] : Authentication verified, req[path]: '${req.path}', redir >>> @/messenger/rooms`);
            res.redirect('/messenger/rooms');
        } else {
            console.log(`@/users > Users Router [ router.use ALL ] : Authentication invalide, req[path]: '${req.path}', sending(report)`);
            return res.json({ result: true, redirect: "/messenger/rooms", alert: "You have already Logged in!!!" });
        }
    } else {
        console.log(`@/users > Users Router [ router.use ] : Authentication invalide...`);
        next();
    }
});


router.get('/', function (req, res, next) {
    console.log(`@/users [ Get ] : >>>>> redir > @/users/login`);
    res.redirect('/users/login');
});

router.get('/login', function (req, res, next) {

    res.render("login", { title: "Sign Up" });

});

router.post("/login", async (req, res) => {
    try {
        console.log(`@/users/login [post] : req.body : ${JSON.stringify(req.body)}`);
        var { email, password } = req.body;
        email = email.replace(/\s+/g, '').toLowerCase();
        //const data = await usersDatabase.find({ email: email });
        const data = await usersDatabase.findOne({ email: email });
        console.log(`@/users/login [post] : mongodb data : ${data}`);
        if (data != null && data.length != 0) {
            const currPassword = password;
            const userPassword = data.password;
            bcrypt.compare(currPassword, userPassword, (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ result: false, alert: "Something went wrong. ensure you have entered a valid input, please try again after sometime or try contacting the admin!!!" });
                    //return res.send("Something went wrong!");
                }

                if (result) {
                    //res.cookie("Subanesh's_server", "Universal chat by Subanesh", { secure: true });
                    //res.cookie('loggedIn', true, { expires: new Date(Date.now() + 900000), httpOnly: true });
                    console.log(`Before cookie set: '${JSON.stringify(req.session.cookie)}'`);
                    const plainCookie = JSON.parse(JSON.stringify(req.session.cookie));
                    console.log(`Plain cookie : '${JSON.stringify(plainCookie)}'`);
                    plainCookie['expires'] = new Date(Date.now() + plainCookie['originalMaxAge']);
                    delete plainCookie['originalMaxAge']; //res.cookie({}) accepts cookie materials only, even if we send something extra, they wont be send
                    res.cookie(req.session.cookie.cookieName, req.session.cookie.cookieValue, plainCookie);
                    // Set-Cookie: undefined=undefined; Max-Age=604794; Path=/; Expires=Thu, 06 Jul 2023 02:42:33 GMT; HttpOnly; Secure
                    req.session.name = data.username;
                    req.session.userId = data.userId;
                    console.log(`After cookie set: '${JSON.stringify(req.session.cookie)}'`);
                    console.log(`Plain cookie : '${JSON.stringify(plainCookie)}'`);
                    console.log(req.session);
                    res.json({ result: true, redirect: `/messenger/rooms`, alert: "login successful!" });
                    //return res.redirect("/");
                } else {
                    res.json({ result: false, alert: "Invalid Password!!!" });
                    //return res.send("Invalid password!");
                }
            });
        } else {
            res.json({ result: false, alert: "Invalid Username, there is no such user exist!!!" });
            //return res.send("There is no such user!");
        }
    } catch (error) {
        console.log(error);
        res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
        //next(createError(400, error));
    }
});

router.get('/register', function (req, res, next) {

    res.render("register", { title: "Register" });

});

router.post("/register", async (req, res) => {
    try {
        console.log(`@/users/register [post] : req.body : ${JSON.stringify(req.body)}`);
        var { username, email, password } = req.body;
        email = email.replace(/\s+/g, '').toLowerCase();
        username = username.replace(/\s+/g, '').toLowerCase();
        //const data = await usersDatabase.find({ email: email });
        const data = await usersDatabase.find({
            $or: [
                { email: email },
                { username: username }
            ]
        });
        console.log(`@/users/login [post] : mongodb data : ${data}`);

        if (data.length == 0) {
            const currPassword = password;
            const encryptedNewPassword = await bcrypt.hash(currPassword, 10);
            const currUserId = randomUUID();

            await usersDatabase.create({
                userId: currUserId,
                username: username,
                email: email,
                password: encryptedNewPassword,
            });
            res.json({ result: true, redirect: `/`, alert: "registration successful! " });
            //res.redirect('/');
        } else {
            //return res.send();
            if (data[0].email === email) {
                res.json({ result: false, alert: `Your account already exist with mail id : ${email}, please login!` });
            } else if (data[0].username === username) {
                res.json({ result: false, alert: `The Username ${username} is notavailable, try creating new!` });
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
});

router.get('/logout', function (req, res) {
    console.log("chearing session cookies....................***********");
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/users/login');
        }
    });
    //res.clearCookie('session')
    //res.redirect('/')
})

module.exports = router;
