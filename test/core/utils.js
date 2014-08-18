
var should = require('should'),
    zlib = require('zlib');
var purest = require('../../lib/provider'),
    utils = require('../../lib/utils');


describe('utils', function () {
    describe('uri', function () {
        it('escape RFC3986 characters', function () {
            utils.uri.rfc3986("!*()'").should.equal('%21%2a%28%29%27');
        });
        it('create qs', function () {
            utils.uri.qs({a:"!*()'",b:2})
                .should.equal('a=%21%2a%28%29%27&b=2');
        });
    });

    describe('sign', function () {
        it('OAuth request signing', function () {
            var qs = utils.sign({
                signature:'plaintext',
                method:'POST',
                url:'https://api.login.yahoo.com/oauth/v2/get_token',
                app:{key:'ck', secret:'cs'},
                user:{token:'t', secret:'ts'},
                params:{some:'params'}
            });
            qs.oauth_consumer_key.should.equal('ck');
            qs.oauth_nonce.should.be.instanceOf(String);
            qs.oauth_signature_method.should.equal('PLAINTEXT');
            qs.oauth_timestamp.should.be.instanceOf(String);
            qs.oauth_token.should.equal('t');
            qs.oauth_version.should.equal('1.0');
            qs.oauth_signature.should.be.instanceOf(String);
        });
    });

    describe('response', function () {
        it('don\'t throw error on missing callback', function () {
            utils.response()(null, {}, {});
        });
        it('return on error', function () {
            utils.response(function (err, res, body) {
                err.should.be.an.instanceOf(Error);
            })(new Error());
        });

        describe('parse string response', function () {
            it('content-encoding: application/json', function (done) {
                utils.response(function (err, res, body) {
                    if (err) return done(err);
                    should.deepEqual(body, {data:'data'});
                    done();
                })(
                    null,
                    {statusCode:200,headers:{'content-encoding':'application/json'}},
                    '{"data":"data"}'
                );
            });
            it('content-type: text/javascript', function (done) {
                utils.response(function (err, res, body) {
                    if (err) return done(err);
                    should.deepEqual(body, {data:'data'});
                    done();
                })(
                    null,
                    {statusCode:200,headers:{'content-type':'text/javascript'}},
                    '{"data":"data"}'
                );
            });
            it('content-type: application/json', function (done) {
                utils.response(function (err, res, body) {
                    if (err) return done(err);
                    should.deepEqual(body, {data:'data'});
                    done();
                })(
                    null,
                    {statusCode:200,headers:{'content-type':'application/json'}},
                    '{"data":"data"}'
                );
            });
            it('handle flickr response', function (done) {
                utils.response(function (err, res, body) {
                    if (err) return done(err);
                    should.deepEqual(body, {data:'data'});
                    done();
                })(
                    null,
                    {statusCode:200,headers:{'content-type':'text/javascript'}},
                    'jsonFlickrApi({"data":"data"})'
                );
            });
            it('return parse error on malformed json', function (done) {
                utils.response(function (err, res, body) {
                    err.message.should.equal('Parse error!')
                    body.should.equal('<html>');
                    done();
                })(
                    null,
                    {statusCode:200,headers:{'content-encoding':'application/json'}},
                    '<html>'
                );
            });
        });

        describe('decompress', function () {
            it('gzip encoded body', function (done) {
                zlib.gzip('{"data":"data"}', function (err, encoded) {
                    utils.response(function (err, res, body) {
                        if (err) return done(err);
                        should.deepEqual(body, {data:'data'});
                        done();
                    })(null, {statusCode:200,headers:{'content-encoding':'gzip'}}, encoded);
                });
            });
            it('deflate encoded body', function (done) {
                zlib.deflate('{"data":"data"}', function (err, encoded) {
                    utils.response(function (err, res, body) {
                        if (err) return done(err);
                        should.deepEqual(body, {data:'data'});
                        done();
                    })(null, {statusCode:200,headers:{'content-encoding':'deflate'}}, encoded);
                });
            });
        });

        it('return error on non successful status code', function (done) {
            utils.response(function (err, res, body) {
                should.deepEqual(err, {data:'data'});
                should.deepEqual(body, {data:'data'});
                done();
            })(
                null,
                {statusCode:500,headers:{'content-encoding':'application/json'}},
                '{"data":"data"}'
            );
        });
        it('succeed on JSON body', function (done) {
            utils.response(function (err, res, body) {
                if (err) return done(err);
                should.deepEqual(body, {data:'data'});
                done();
            })(null, {statusCode:200,headers:{}}, {data:'data'});
        });
    });
});