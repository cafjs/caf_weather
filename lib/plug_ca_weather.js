/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

/**
 * Calls a weather service for this CA.
 *
 *
 * @module caf_weather/plug_ca_weather
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;
const json_rpc = require('caf_transport').json_rpc;

exports.newInstance = async function($, spec) {
    try {
        let handleMethod = null;

        let that = genPlugCA.constructor($, spec);

        let keyAPI = '';

        // transactional ops
        const target = {
            async queryImpl(id, city) {
                let result = [null];
                try {
                    result[1] = await $._.$.weather.query(city, keyAPI);
                } catch (err) {
                    result[0] = err;
                }
                if (handleMethod !== null) {
                    /* Response processed in a separate transaction, i.e.,
                     using a fresh message */
                    let m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                   handleMethod, id,
                                                   result);
                    $.ca.__ca_process__(m, function(err) {
                        err && $.ca.$.log &&
                            $.ca.$.log.error('Got handler exception ' +
                                             myUtils.errToPrettyStr(err));
                    });
                } else {
                    const logMsg = 'Ignoring reply ' + JSON.stringify(result);
                    $.ca.$.log && $.ca.$.log.warn(logMsg);
                }
                return [];
            },
            async setHandleReplyMethodImpl(methodName) {
                handleMethod = methodName;
                return [];
            },
            async setKeyAPIImpl(key) {
                keyAPI = key;
                return [];
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.query = function(city) {
            const id = myUtils.uniqueId();
            let allArgs = [id, city];
            that.__ca_lazyApply__('queryImpl', allArgs);
            return id;
        };

        that.setKeyAPI = function(key) {
            that.__ca_lazyApply__('setKeyAPIImpl', [key]);
        };

        that.setHandleReplyMethod = function(methodName) {
            that.__ca_lazyApply__('setHandleReplyMethodImpl', [methodName]);
        };

        that.dirtyQuery = function(city) {
            return $._.$.weather.query(city, keyAPI);
        };

        const super__ca_resume__ =
                myUtils.superiorPromisify(that, '__ca_resume__');
        that.__ca_resume__ = async function(cp) {
            cp = cp || {};
            try {
                handleMethod = cp.handleMethod;
                keyAPI = cp.keyAPI || '';
                await super__ca_resume__(cp);
                return [];
            } catch (err) {
                return [err];
            }
        };

        const super__ca_prepare__ =
                myUtils.superiorPromisify(that, '__ca_prepare__');
        that.__ca_prepare__ = async function() {
            try {
                let data = await super__ca_prepare__();
                data.handleMethod = handleMethod;
                data.keyAPI = keyAPI;
                return [null, data];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
