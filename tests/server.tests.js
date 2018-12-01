var chai = require('chai');
var chaiHttp = require('chai-http');
var {app} = require('../server');
var should = chai.should();
var refreshToken;
chai.use(chaiHttp);
describe('Token Assignment', () => {

    it('should return a valid token', (done) => {
        chai.request(app).post('/oauth/token/')
            .send('username=sidh')
            .send('password=123456')
            .send('grant_type=password').end((err, res) => {
                res.should.have.status(200);
                should.exist(res.body.access_token);
                refreshToken = res.body.refresh_token;
                done();
            });
            done();
    });

    it('should return a valid token using the refresh token', (done) => {
        chai.request(app).post('/oauth/token/')
            .send(`refresh_token=${refreshToken}`)
            .send('grant_type=refresh_token')
            .end((err, res) => {
                res.should.have.status(200);
                should.exist(res.body.access_token);
                done();
            });
            done();
    });

    it('should not return a valid token given unvalid authorization', (done) => {
        chai.request(app).post('/oauth/token/')
            .send('username=sidh')
            .send('password=abcdef')
            .send('grant_type=password').end((err, res) => {
                res.should.have.status(400);
                done();
            });
            done();
    });


})