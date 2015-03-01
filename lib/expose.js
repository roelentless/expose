'use strict';

var fs = require('fs');
var _ = require('lodash');
var shell = require('./shell.js');
var q = require('q');





// load filters
var _filters = {};

function addFilter(filterName, filter) {
    if( _filters[filterName] != undefined ) {
        console.error('filter '+filterName+' already exists');
        return;
    }
    _filters[filterName] = filter;
}


fs.readdirSync('./lib/filters/').forEach(function(filename) {
    if( _.endsWith(filename, '.js') ) {
        var filterName = filename.replace('.js','');
        var filterDefn = require("./filters/" + filename);
        addFilter(filterName, new filterDefn());
    }
});

if(_.keys(_filters) === 0) {
    console.warn("no filters found?");
} else {
    console.log("available filters: " + _.keys(_filters).join(", "));
}





// load hook configs
var _hooks = {};

function addHook(hook) {
    if( _hooks[hook.url_key] != undefined ){
        console.error('hook for '+hook.url_key+' already exists');
        return;
    }

    hook.feedback_on = hook.feedback_on || 'post_filters';

    _hooks[hook.url_key] = hook;
}


fs.readdirSync('./hooks.d/').forEach(function(filename) {
    if( _.endsWith(filename, '.json') ) {
        var hooks = JSON.parse(fs.readFileSync('./hooks.d/'+filename));
        hooks.forEach(function(hook) {
            addHook(hook);
        });
    }
});

console.log("configured webhooks: ");
if(_.keys(_hooks).length === 0) {
    console.warn("No hooks found in hooks.d!");
} else {
    _.keys(_hooks).forEach(function(hook){
        console.log("hook url key: "+hook);
    })
}




function testFilters(req, res, hookConfig) {
    var deferred = q.defer();

    var filters = q();

    hookConfig.when.forEach(function (filterConfig) {
        filters = filters.then(function() {
            var filter = _filters[filterConfig.filter];
            console.log(hookConfig.url_key+" - performing filter "+filterConfig.filter);
            return filter.perform(filterConfig, req);
        });
    });

    filters
        .then(function() {
            console.log(hookConfig.url_key+" - filters: all filters passed");
            deferred.resolve();
        })
        .catch(function (error) {
            console.error(hookConfig.url_key+" - a filter was rejected");
            console.error(error);
            deferred.reject(error);
        });

    return deferred.promise;
}



function runTasks(req, res, hookConfig) {
    var deferred = q.defer();

    var taskChain = q();

    hookConfig.tasks.forEach(function(taskConfig) {
        taskChain = taskChain.then(function() {
            console.log(hookConfig.url_key+" - performing task "+taskConfig.exec);
            return shell.exec_dir(taskConfig['exec'], taskConfig['dir'], hookConfig.url_key)
        });
    });

    taskChain
        .then(function() {
            console.log(hookConfig.url_key+" - tasks: all tasks completed");
            deferred.resolve();
        })
        .catch(function(error) {
            console.log(hookConfig.url_key+" - a task failed");
            console.error(error);
            deferred.reject(error);
        });

    return deferred.promise;
}



function processRequest(req, res) {

    var urlKey = req.params.url_key;
    if( urlKey == undefined || _hooks[urlKey] == undefined ) {
        res.sendStatus(404);
        return;
    }

    console.log(urlKey +" - webhook received");

    var hookConfig = _hooks[urlKey];
    if(hookConfig.when == undefined) hookConfig.when = [];

    q.fcall(function() { return testFilters(req, res, hookConfig) })
        .then(function() {
            if(hookConfig.feedback_on === 'post_filters') {
                res.send("tasks started");
            }
        })
        .then(function() { return runTasks(req, res, hookConfig) })
        .then(function() {
            console.log(hookConfig.url_key + " - tasks completed");
            if(hookConfig.feedback_on === 'finished') {
                res.send("all tasks ok");
            }
        })
        .catch(function(error) {
            res.sendStatus(400);
            console.error(error);
        });
}




module.exports = {
    processRequest: processRequest
}