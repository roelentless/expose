'use strict';

var q = require('q');
var shell = require('../shell.js');
var _ = require('lodash');

function GitRemoteStatus() {}

GitRemoteStatus.prototype = {

    perform: function(config, req) {

        var deferred = q.defer();

        shell.exec_dir('git remote -v | grep fetch | cut -f2 | cut -d" " -f1', config.dir).then(function(remote) {
            shell.exec_dir('git branch | cut -d" " -f2', config.dir).then(function(local_branch) {
                shell.exec_dir('git ls-remote '+remote+' | grep '+local_branch+' | cut -f1', config.dir).then(function(remote_head) {
                    shell.exec_dir('git rev-parse HEAD', config.dir).then(function(local_head) {
                        var result = local_head === remote_head ? 'remote-identical' : 'remote-different';
                        if( result === config.value ) {
                            deferred.resolve();
                        } else {
                            deferred.reject(new Error("config."+config.value+" is different from result "+result));
                        }
                    }, function(err) {
                        deferred.reject(new Error("could not find local version"));
                    });
                }, function(err) {
                    deferred.reject(new Error("could not find remote version"));
                });
            }, function(err) {
                deferred.reject(new Error("could not find branch"));
            });
        }, function(err) {
            deferred.reject(new Error("could not find remote"));
        });

        return deferred.promise;
    }

};

module.exports = GitRemoteStatus;
