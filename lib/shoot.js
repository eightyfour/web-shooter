/**
 * Created by phen on 4/3/14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),
    fs = require('fs'),
    webshot = require('webshot');

function createFolderIfNotExists(rootFolder, folder, cb) {
    "use strict";
    fs.mkdir(rootFolder + '/' + folder, cb);
}

var shot = function (server, appFolder) {
    "use strict";
    var conTrade,
        trade = shoe(function (stream) {

            var d = dnode({
                setupClient : function (res, cb) {
                    console.log('CLIENT CONECTION:', res);
                    cb();
                },
                takeShot : function (obj, cb) {
                    var fileName = (obj.fileName || (obj.url + '.jpg')),
                        folderName = '',
                        doShoot = function () {
                            var fileNameBig = 'big_' + fileName;
                            // TODO error handling
                            webshot(obj.url, appFolder + folderName + fileName, {
                                shotSize : {
                                    width : 'window',
                                    height : 'window'
                                }
                            }, function (err) {
                                console.log('takeShot small err:', err);
                                cb({
                                    size: 'small',
                                    fileName: fileName,
                                    url : obj.url,
                                    folderName : folderName,
                                    initObj : obj
                                });
                            });
                            webshot(obj.url, appFolder + folderName + fileNameBig, {
                                shotSize : {
                                    height : 'all'
                                }
                            }, function (err) {
                                console.log('takeShot big err:', err);
                                cb({
                                    size: 'big',
                                    fileName: fileNameBig,
                                    url : obj.url,
                                    folderName : folderName,
                                    initObj : obj
                                });
                            });
                        };
                    while (/\//.test(fileName)) {
                        fileName = fileName.replace('/', '_');
                    }
                    if (obj.folderName) {
                        folderName = obj.folderName + '/';
                        createFolderIfNotExists(appFolder, obj.folderName, doShoot);
                    } else {
                        doShoot();
                    }
                }
            });
            d.pipe(stream).pipe(d);
            conTrade = stream;

            conTrade.on('end', function () {
                console.log('end');
            });
        });
    // register server on path shot
    trade.install(server, '/shoot');

};

module.exports = shot;
