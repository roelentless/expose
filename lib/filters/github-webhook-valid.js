'use strict';

var q = require('q');
var crypto = require('crypto');
var rawbody = require('raw-body');

function GithubWebhookValid() {}

GithubWebhookValid.prototype = {

    perform: function(config, req) {
        var deferred = q.defer();

        var xhub = req.header('X-Hub-Signature');
        if(!xhub) {
            deferred.reject(new Error("could not find X-Hub-Signature in the headers"));
        } else {
            var rawOptions = {
                length: req.header('content-length'),
                limit: '100kb',
                encoding: 'utf-8'
            };

            rawbody(req, rawOptions, function (err, buffer) {
                if(err) {
                    console.log(err);
                }
                var hmac = crypto.createHmac("sha1", config.secret);
                hmac.update(buffer);
                var expected = 'sha1=' + hmac.digest('hex');

                if(xhub === expected) {
                    deferred.resolve();
                } else {
                    deferred.reject(new Error("couldn't validate request X-Hub signature"));
                }
            });
        }
        return deferred.promise;
    }

};

module.exports = GithubWebhookValid;