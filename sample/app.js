/*global console */
/*jslint node: true */


var express = require('express'),
    fs = require('fs'),
    file = require('../lib/file.js'),
    shooter = require('../lib/shoot.js');
var app = express(),
    server;

app.use(express.static(__dirname + '/resources'));

app.get('/*', function (request, response, next) {
    "use strict";

    var req = request;
    //    var fileName = req.originalUrl.split(':')[0];
    var fileName = req.path || '/'; //load always index
    var res = response;
    var htmlExtension = '.html';

    fs.exists(__dirname + '/' + fileName, function (exists) {

        if (exists) {
//            console.log(fileName);
            if (fileName === '/') {
                fs.readFile(__dirname + '/index.html', function (err, data) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(data);
                    res.end();
                });
            } else {
                fs.readFile(__dirname + '/' + fileName, function (err, data) {
                    if (err === null) {
                        var ext = fileName.slice(fileName.lastIndexOf('.') + 1), contentType = "text/html";
                        if (ext === 'css') {
                            contentType = "text/css";
                        } else if (ext === 'js') {
                            contentType = "text/javascript";
                        } else {
                            contentType = "image/" + ext;
                        }
                        res.writeHead(200, {'Content-Type': contentType});
                        res.write(data);
                        res.end();
                    } else {
                        console.log('APP ERROR reading ' + __dirname + '/' + fileName + ' not possible!', err);
                        res.end();
                    }
                });
            }
        } else {
            next();
        }
    });
});

server = app.listen(8000);
console.log("start server 8000");

shooter(server, __dirname + "/resources/shoots/");