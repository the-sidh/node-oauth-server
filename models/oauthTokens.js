var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const { secret } = require('../config/database');
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');
const jwt = require('jsonwebtoken');
var promisify = require('promisify-any').use(Promise);

mongoose.model('OAuthTokens', new Schema({
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    client: { type: Object },
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    user: { type: Object },
    userId: { type: String },
}));

mongoose.model('OAuthClients', new Schema({
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array }
}));

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles:[ {
        type: String,
        enum: ['reader', 'creator', 'editor'],
        default: 'reader'
    }],
})

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

mongoose.model('OAuthUsers', UserSchema);
var OAuthTokensModel = mongoose.model('OAuthTokens');
var OAuthClientsModel = mongoose.model('OAuthClients');
var OAuthUsersModel = mongoose.model('OAuthUsers');

module.exports = { OAuthTokensModel, OAuthClientsModel, OAuthUsersModel };
module.exports.getAccessToken = async function (bearerToken) {
    return await OAuthTokensModel.findOne({ accessToken: bearerToken });
};

module.exports.generateAccessToken = async function (client, user, scope) {

    var access = 'auth';
    var token = jwt.sign({
        roles: user.roles,
        access
    }, secret).toString();
    return token;
}

module.exports.getClient = function (clientId, clientSecret) {

    const client = {
        clientID: clientId,
        clientSecret: clientSecret,
        grants: ['password','refresh_token'],
        redirectUris: null
    }
    return client;
    //callback(false, client);
};

module.exports.grantTypeAllowed = (clientID, grantType, callback) => {


    callback(false, true);
}

module.exports.revokeToken = async function (token) {
    let result = await OAuthTokensModel.findOneAndDelete({refreshToken:token.refreshToken});
    return !!result;
};


module.exports.getRefreshToken = async function (refreshToken) {
    return await OAuthTokensModel.findOne({ refreshToken: refreshToken });
};


module.exports.getUser = async function (username, password, callback) {
    let userfound = await OAuthUsersModel.findOne({ 'username': username });
    passwordCheck = await bcrypt.compare(password, userfound.password, (err, res) => {
        if (!res) {            
            callback();
        } else {
            callback(false, userfound);
        }
    });

};

module.exports.saveToken = async function (token, client, user, callback) {
    var accessToken = new OAuthTokensModel({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        client: client,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user: user,
        userId: user._id,
    });
    await accessToken.save();
    callback(false, accessToken);

};