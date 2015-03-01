'use strict';

var q = require('q');

function HeaderMatch() {}

HeaderMatch.prototype = {

    perform: function(config, req) {
        var deferred = q.defer();

        if(req.headers[config.key] != undefined) {
            if( req.headers[config.key] === config.value ) {
                deferred.resolve(true);
            } else {
                deferred.reject(new Error("header doesn't match"));
            }
        } else {
            deferred.reject(new Error("key not in headers"));
        }

        return deferred.promise;
    }

};

module.exports = HeaderMatch;