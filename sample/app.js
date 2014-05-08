/*global console */
/*jslint node: true */


var express = require('express'),
    fs = require('fs'),
    file = require('../lib/file.js'),
    shooter = require('../lib/shoot.js'),
    app,
    server;

app = express();

var extensionMap = {
    css : 'text/css',
    js : 'text/javascript',
    xml: 'application/xml',
    swf: 'application/x-shockwave-flash'

}

getContentType = function (ext) {
    if (extensionMap.hasOwnProperty(ext)) {
        return extensionMap[ext];
    }
    return "image/" + ext;
}

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});


app.use("/resources", express.static(__dirname + '/resources'));

app.get('/', function (request, response, next) {
    "use strict";
    console.log('PROVIDE RESOURCE');
    var req = request;
    //    var fileName = req.originalUrl.split(':')[0];
    var fileName = req.path || '/'; //load always index
    var res = response;
    var htmlExtension = '.html';

    fs.exists(__dirname + '/' + fileName, function (exists) {

        if (exists) {
//            console.log(fileName);
            if (fileName === '/') {
                fs.readFile(__dirname + '/resources/coverFlow.html', function (err, data) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(data);
                    res.end();
                });
            } else {
                fs.readFile(__dirname + '/' + fileName, function (err, data) {
                    if (err === null) {
                        var ext = fileName.slice(fileName.lastIndexOf('.') + 1);
                        res.writeHead(200, {'Content-Type': getContentType(ext)});
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

server = app.listen(8080);
console.log("start server 8080");

shooter(server, __dirname + "/resources/shoots/");