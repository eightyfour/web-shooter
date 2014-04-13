/**
 * Created by phen on 4/3/14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),
    fs = require('fs'),
    file = require('./file.js'),
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
                getScreenShots : function (category, cb) {
                    file.getJSONFile(appFolder + category  + '/meta.json', function (metaJSON) {
                        if (metaJSON) {
                            Object.keys(metaJSON).forEach(function (meta) {
                                cb(metaJSON[meta]);
                            });
                        } else {
                            cb(false);
                        }
                    });
                },
                takeShot : function (obj, cb) {
                    var fileName = (obj.fileName || (obj.url + '.jpg')),
                        // saveFilePath is also used to generate the storage JSON id
                        saveFilePath = appFolder + obj.category + '/' +  fileName,
                        saveFileBigPath = appFolder + obj.category + '/big/' + fileName,
                        folderName = '',
                        metaFileObj = {
                            fileName: fileName,
                            category: obj.category,
                            url : obj.url,
                            srcPic: obj.srcPic,
                            srcBigPic: obj.srcBigPic
                        },
                        doShoot = function () {
                            // TODO error handling
                            webshot(obj.url, saveFilePath, {
                                shotSize : {
                                    width : 'window',
                                    height : 'window'
                                }
                            }, function (err) {
                                console.log('takeShot small err:', err);
                                cb(metaFileObj);
                            });
                            webshot(obj.url, saveFileBigPath, {
                                shotSize : {
                                    height : 'all'
                                }
                            }, function (err) {
                                console.log('takeShot big err:', err);
                            });
                        },
                        metaFileShotId = file.generateFilePathId(saveFilePath);
                    console.log('TAKE A SHOT', metaFileObj);
                    while (/\//.test(fileName)) {
                        fileName = fileName.replace('/', '_');
                    }
                    if (obj.folderName) {
                        folderName = obj.folderName + '/';
                        createFolderIfNotExists(appFolder, obj.folderName, doShoot);
                    } else {
                        doShoot();
                    }
                    // read current JSON and save new one
                    file.getJSONFile(appFolder + obj.category  + '/meta.json', function (metaJSON) {
                        if (!metaJSON) {
                            metaJSON = {};
                        }
                        metaJSON[metaFileShotId] = metaFileObj;
                        console.log('MTA JSON:', metaJSON);
                        file.saveAsJSON(appFolder + obj.category  + '/meta.json', metaJSON);
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
    trade.install(server, '/shoot');

};

module.exports = shot;
