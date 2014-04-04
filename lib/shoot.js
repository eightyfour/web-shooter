/**
 * Created by phen on 4/3/14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),
    webshot = require('webshot');

var shot = function (server) {
    "use strict";
    var conTrade,
        trade = shoe(function (stream) {

            var d = dnode({
                setupClient : function (res, cb) {
                    console.log('CLIENT CONECTION:', res);
                    cb();
                },
                takeShot : function (url, cb) {
                    webshot(url, {
                        shotSize : {
                            height : 'all'
                        }
                    }, function (err, renderStream) {
                        console.log('RENDER STREAM');
                        renderStream.on('data', function (data) {
                            console.log('RENDER ON DATA');
                            cb(data.toString('base64'));
                        });
                    });
                }
            });
            d.pipe(stream).pipe(d);
            conTrade = stream;

            conTrade.on('end', function () {
                console.log('end');
            });
        });
    // register server on path shot
    trade.install(server, '/shot');

};

module.exports = shot;
