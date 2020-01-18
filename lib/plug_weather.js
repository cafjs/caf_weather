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
 * Calls an external service to obtain weather info.
 *
 *  Properties:
 *
 *       {weatherURL: string, openweathermap: boolean, keyAPI: string}
 *
 * where:
 *
 * * `weatherURL:` URL for the weather service.
 * * `openweathermap:` whether to use `openweathermap.org` API, it defaults to
 * `wttr.in`.
 * * `keyAPI:` API key for `openweathermap.org`.
 *
 * @module caf_weather/plug_weather
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const assert = require('assert');
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlug = caf_comp.gen_plug;
const request = require('request');

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.constructor($, spec);

        $._.$.log && $._.$.log.debug('New weather plug');

        assert.equal(typeof spec.env.weatherURL, 'string',
                     "'spec.env.weatherURL' is not a string");

        assert.equal(typeof spec.env.openweathermap, 'boolean',
                     "'spec.env.openweathermap' is not a boolean");
        const useOpenWeatherMap = spec.env.openweathermap;

        if (useOpenWeatherMap) {
            assert.equal(typeof spec.env.weatherKeyAPI, 'string',
                         "'spec.env.weatherKeyAPI' is not a string");
        }

        that.query = function(city, myKeyAPI) {
            const parseWeather = function(info) {
                const kToF = (k) => k*(9.0/5.0) - 459.67; // Kelvin to Farenh.
                const msToMh = (ms) => ms*2.2369; //meters/sec to miles/hour
                if (!useOpenWeatherMap) {
                    const q = info.split(' ');
                    if (q && (q.length == 4)) {
                        return {
                            city: city, humidity: parseInt(q[0]),
                            temp: parseInt(q[1]), wind: parseInt(q[2].slice(1))
                        };
                    } else {
                        $._.$.log && $._.$.log.warn(q.join(' '));
                        return {city: city};
                    }
                } else {
                    try {
                        return {
                            city: city, humidity: info.main.humidity,
                            temp: kToF(info.main.temp),
                            wind: msToMh(info.wind.speed)
                        };
                    } catch (err) {
                        $._.$.log &&
                            $._.$.log.warn(myUtils.errToPrettyStr(err));
                        $._.$.log && $._.$.log.warn(JSON.stringify(info));
                        return {city: city};
                    }
                }
            };

            return new Promise((resolve, reject) => {
                const options = {};
                if (useOpenWeatherMap) {
                    let owmURL = spec.env.weatherURL;
                    if (myKeyAPI) {
                        owmURL = owmURL.replace(/samples/, 'api');
                    }
                    options.uri = owmURL + '?q=' + city +
                        '&appid=' + (myKeyAPI || spec.env.weatherKeyAPI);
                    options.json = true;
                } else {
                    options.uri = spec.env.weatherURL + '/' + city +
                        '?format=%h+%t+%w';
                }
                request(options, function(err, response, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(parseWeather(body));
                    }
                });
            });
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
