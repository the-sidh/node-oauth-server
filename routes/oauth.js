const _ = require('lodash');
var express = require('express');
const router = express.Router();

const { app } = require('../server');
const { OAuthUsersModel } = require('../models/oauthTokens');

router.post('/register', async function (req, res) {
    var body = _.pick(req.body, ['username', 'password', 'roles']);
    if (!body.username || !body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = new OAuthUsersModel({
            username: body.username,
            password: body.password,
            roles: body.roles
        });
        // save the user
        try {
            await newUser.save();

            res.send(newUser);
        } catch (err) {
            res.status(400).send({ err: err.message });
        }

    }
});

const getToken = (req, res, next) => {
    req.body.client_id = 'nil';
    req.body.client_secret = 'nil';
    req.body.scope = req.body.scope == '' ? 'read' : req.body.scope;
    let d = app.oauth.token();
    d(req, res, next);
}

router.post('/token', getToken, (req, res, next) => {
    res.status(200).send()
    next();
});


router.get('/authenticate', app.oauth.authenticate(), (req, res, next) => {
    res.status(200).send()
    next();
});

router.get('/test',  (req, res, next) => {
    res.status(200).send('oauth server up and running');
    next();
});

module.exports = router;