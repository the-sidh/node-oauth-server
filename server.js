var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/GatewayViviPay';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/GatewayViviPayTest'
}

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const oAuth2Server = require('express-oauth-server');
const oAuthModel = require('./models/oauthTokens');

const mongoose = require('mongoose');
const config = require('./config/database');


mongoose.connect(config.database);
var app = express();

app.oauth = new oAuth2Server({
    model: oAuthModel,
    grants: ['password', 'refresh_token'],
    requireClientAuthentication: {'password' : false, 'refresh_token' : false}

});

var port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

module.exports = { mongoose, app };
const api = require('./routes/oauth');
app.use('/oauth', api);

app.listen(port);

