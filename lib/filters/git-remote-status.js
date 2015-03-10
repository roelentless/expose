'use strict';

var q = require('q');
var shell = require('../shell.js');
var _ = require('lodash');

function GitRemoteStatus() {}

GitRemoteStatus.prototype = {

    perform: function(config, req) {

        var deferred = q.defer();

        shell.exec_dir('git remote -v | grep fetch | cut -f2 | cut -d" " -f1', config.dir, config.sudo_user).then(function(remote) {
            shell.exec_dir('git rev-parse --abbrev-ref HEAD', config.dir, config.sudo_user).then(function(local_branch) {
                shell.exec_dir('git ls-remote '+remote+' | grep "refs/heads/'+local_branch+'$" | cut -f1', config.dir, config.sudo_user).then(function(remote_head) {
                    shell.exec_dir('git rev-parse HEAD', config.dir, config.sudo_user).then(function(local_head) {
                        var result = local_head === remote_head ? 'identical' : 'different';
                        if( result === config.remote_status ) {
                            deferred.resolve();
                        } else {
                            deferred.reject(new Error("config."+config.remote_status+" is different from result "+result));
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
