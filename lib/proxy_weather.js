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
 *  Proxy that allows a CA to query  weather info.
 *
 * @module caf_weather/proxy_weather
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Sets the key API for the weather service (openweathermap.org).
         *
         * @param {string} key An API key for the weather service.
         *
         *
         * @memberof! module:caf_weather/proxy_weather#
         * @alias setKeyAPI
         */
        that.setKeyAPI = function(key) {
            return $._.setKeyAPI(key);
        };

        /**
         * Query service weather info outside the transaction.
         *
         * The type `weatherInfoType` is :
         *
         *      {city: string, temp: number, humidity: number, wind: number}
         *
         * @param {string} city A city to query.
         *
         * @return {Promise<weatherInfoType>}  A promise to return some weather
         * info, or an error if we cannot contact the weather service.
         *
         * @memberof! module:caf_weather/proxy_weather#
         * @alias dirtyQuery
         */
        that.dirtyQuery = function(city) {
            return $._.dirtyQuery(city);
        };

        /**
         * Query service weather info.
         *
         * Results are received in a separate method invocation. If not set the
         * reply is ignored.
         *
         * @param {string} city A city to query.
         *
         * @return {string} A unique identifier to match
         * replies for this request.
         *
         * @memberof! module:caf_weather/proxy_weather#
         * @alias query
         */
        that.query = function(city) {
            return $._.query(city);
        };

        /**
         * Sets the name of the method in this CA that will process
         * reply `query()` messages.
         *
         * The type of the method is `async function(requestId, response)`
         *
         * where:
         *
         *  *  `requestId`: is an unique identifier to match the request.
         *  *  `response` is a tuple using the standard
         *    `[Error, weatherInfoType]` CAF.js convention.
         *
         * @param {string| null} methodName The name of this CA's method that
         *  process replies.
         *
         * @memberof! module:caf_weather/proxy_weather#
         * @alias setHandleReplyMethod
         *
         */
        that.setHandleReplyMethod = function(methodName) {
            $._.setHandleReplyMethod(methodName);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
