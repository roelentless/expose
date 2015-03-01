'use strict';

var q = require('q');

function Passthrough() {};

Passthrough.prototype = {

    perform: function(config, req) {
        var deferred = q.defer();
        deferred.resolve(true);
        return deferred.promise;
    }

};

module.exports = Passthrough;