"use strict"

var hello = require('./hello/main.js');
var app = hello;

var caf_core= require('caf_core');
var caf_comp = caf_core.caf_components;
var myUtils = caf_comp.myUtils;
var async = caf_comp.async;
var cli = caf_core.caf_cli;

var crypto = require('crypto');

var APP_FULL_NAME = 'root-weather';

var CA_OWNER_1='me'+ crypto.randomBytes(8).toString('hex');
var CA_LOCAL_NAME_1='ca1';
var FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
var FQN_1 = APP_FULL_NAME + '#' + FROM_1;

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp: function (cb) {
       var self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown: function (cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    dirtyQuery: function(test) {
        var self = this;
        var s1;
        var from1 = FROM_1;
        test.expect(3);
        var lastId;
        async.series(
            [
                function(cb) {
                    s1 = new cli.Session('ws://root-weather.vcap.me:3000',
                                         from1, {from : from1});
                    s1.onopen = async function() {
                        try {
                            let x = await s1.dirtyQuery('Paris').getPromise();
                            console.log(x);
                            test.ok(true);
                            cb(null);
                        } catch (err) {
                            test.ok(false, 'Got exception ' + err);
                            cb(err);
                        }
                    };
                },
                function(cb) {
                    s1.onclose = function(err) {
                        test.ifError(err);
                        cb(null, null);
                    };
                    s1.close();
                }
            ], function(err, res) {
                test.ifError(err);
                test.done();
            });
    }


};
