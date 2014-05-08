/**
 * Created by phen on 4/3/14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),
    fs = require('fs'),
    file = require('./file.js'),
    webshot = require('webshot'),
    delemitterSplit = '__&__',
    delemitterQuestionMark = '__@__';

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
                getScreenShots : function (category, cb, ready) {
                    file.getJSONFile(appFolder + category  + '/meta.json', function (metaJSON) {
                        if (metaJSON) {
                            Object.keys(metaJSON).forEach(function (meta) {
                                // no need to check if the file exist
                                cb(metaJSON[meta]);
                            });
                            ready && ready(true);
                        } else {
                            cb(false);
                        }
                    });
                },
                deleteShot : function (obj, cb) {
                    var metaFileShotId = file.generateFilePathId(appFolder + obj.category + '/' +  obj.fileName);
                    fs.unlink(appFolder + obj.category + '/' +  obj.fileName, function (err) {
                        fs.unlink(appFolder + obj.category + '/big/' +  obj.fileName, function (err) {
                            cb(true);
                        });
                    });

                    file.getJSONFile(appFolder + obj.category  + '/meta.json', function (metaJSON) {
                        if (!metaJSON) {
                            metaJSON = {};
                        }
                        if (metaJSON.hasOwnProperty(metaFileShotId)) {
                            delete metaJSON[metaFileShotId];
                            file.saveAsJSON(appFolder + obj.category  + '/meta.json', metaJSON);
                        } else {
                            console.log('No meta JSON found for', appFolder + obj.category + '/' +  obj.fileName, metaFileShotId);
                        }
                    });

                },
                takeShot : function (obj, cb) {
                    var fileName = (obj.fileName || (obj.url.replace('//', '/') + '.jpg')),
                        // saveFilePath is also used to generate the storage JSON id
                        saveFilePath,
                        saveFileBigPath,
                        metaFileObj = {
                            viewId: obj.category + '_' + obj.fileName,
                            fileName: fileName,
                            desc: obj.desc,
                            delay: obj.delay,
                            category: obj.category,
                            url : obj.url,
                            srcPic: obj.srcPic,
                            srcBigPic: obj.srcBigPic
                        },
                        doShoot = function () {
                            // TODO error handling
                            webshot(obj.url, saveFilePath, {
                                renderDelay: obj.delay,
//                                phantomConfig: {
//                                    cookiesFile: appFolder + obj.category + '/keks.txt'
//                                }

//                                script: 'setTimeout(function () {document.querySelectorAll("[name=j_username]")[0].value = "handroid";document.querySelectorAll("[name=j_password]")[0].value = "hanibo";document.querySelectorAll("button.loginSubmitButton")[0].click();},2000)',
//                                script: "document.querySelectorAll('[name=j_username]')[0].value = 'handroid';document.querySelectorAll('[name=j_password]')[0].value = 'hanibo';document.querySelectorAll('button.loginSubmitButton')[0].click();",
//                                script: 'alert("hushushdu")',
//                                onLoadFinished: {
//                                    fn: function(status) {
//                                        alert('huhu');
//                                        document.querySelectorAll('[name=j_username]')[0].value = 'handroid';
//                                        document.querySelectorAll('[name=j_password]')[0].value = 'hanibo';
//                                        document.querySelectorAll('button.loginSubmitButton')[0].click();
//                                    }
//                                },
                                shotSize : {
                                    width : 'window',
                                    height : 'window'
                                }
                            }, function (err) {
                                console.log('takeShot small err:', err);
                                cb(metaFileObj);
                            });
                            webshot(obj.url, saveFileBigPath, {
                                renderDelay: obj.delay,
                                shotSize : {
                                    height : 'all'
                                }
                            }, function (err) {
                                console.log('takeShot big err:', err);
                            });
                        },
                        metaFileShotId;
//                    console.log('TAKE A SHOT', metaFileObj);
                    while (/\//.test(metaFileObj.fileName)) {
                        metaFileObj.fileName = metaFileObj.fileName.replace('/', delemitterSplit);
                    }
                    metaFileObj.fileName = metaFileObj.fileName.replace('?', delemitterQuestionMark);
                    metaFileObj.viewId = obj.category + '_' + metaFileObj.fileName;
                    saveFilePath = appFolder + obj.category + '/' +  metaFileObj.fileName;
                    saveFileBigPath = appFolder + obj.category + '/big/' +  metaFileObj.fileName;
                    metaFileShotId = file.generateFilePathId(saveFilePath);
                    metaFileObj.srcPic = '/resources/shoots/' + obj.category + '/' + metaFileObj.fileName;
                    metaFileObj.srcBigPic = '/resources/shoots/' + obj.category + '/big/' + metaFileObj.fileName;
                    //                    if (obj.folderName) {
                        // check if realy needed - webshot can aslo create folders
//                        createFolderIfNotExists(appFolder, obj.folderName, doShoot);
//                    } else {
                    doShoot();
//                    }
                    // read current JSON and save new one
                    file.getJSONFile(appFolder + obj.category  + '/meta.json', function (metaJSON) {
                        if (!metaJSON) {
                            metaJSON = {};
                        }
                        metaJSON[metaFileShotId] = metaFileObj;
//                        console.log('MTA JSON:', metaJSON);
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
