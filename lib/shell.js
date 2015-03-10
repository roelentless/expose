'use strict';

var exec = require('child_process').exec;
var q = require('q');
var _ = require('lodash');

function exec_dir(command, chdir, sudo_user) {
    var deferred = q.defer();

    var _command = '';

    if(sudo_user) {
        _command = 'sudo -u '+sudo_user+' ';
    }

    _command += 'bash -l -c \'cd '+chdir+' ; '+command+'\'';

    //console.log(_command);

    exec(_command, function (error, stdout, stderr) {
        if(error) {
            console.log(stderr);
            deferred.reject(error);
        } else {
            deferred.resolve(_.trim(stdout));
        }
    });

    return deferred.promise;
}

module.exports = {
    exec_dir: exec_dir
};