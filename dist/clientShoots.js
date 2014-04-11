var canny = require('canny'),
    shoe = require('shoe'),
    domOpts = require('dom-opts'),
    shotOptsPanel = require('./shotOptsPanel.js'),
    dnode = require('dnode');

var stream = shoe('/shoot');
var d = dnode();

/**
 * Canny module shooter
 */
var shooter = (function () {
    "use strict";

    function CannyMod(fc) {
        var that = this;
        this.node = null;
        this.add = function (node) {
            console.log('INIT CannyMod', node);
            that.node = node;
            fc && fc.call(that);
        };
    }

    function ViewShootModule(node, name) {
        var main = this;
        this.id = name; // save name as id

        this.button = new CannyMod(function () {
            var that = this;
            this.node.addEventListener('click', function () {
                var url = main.input.node.value;
                // TODO CHECK IF IMAGE IS VALID
                trade.takeShot({
                    url : url,
                    fileName: url + '.jpg',
                    folderName: name
                }, main.imgContainer.createContent);
            });
        });

        this.input = new CannyMod();

        this.imgContainer = new CannyMod();

        //TODO has problems with question marks (?). Fix it!
        this.imgContainer.createContent = function (config) {
            var img = new Image(),
                wrapper = document.getElementById(name + config.fileName);

            if (wrapper) {
                // delete old wrapper and replace it by new one
                wrapper.domRemove();
            }

            if (config.size === 'small') {
                console.log('ADD IMAGE TO CONTAINER', config.fileName);
                wrapper = domOpts.createElement('div', name + config.fileName, 'shot');
                img.src = "/resources/shoots/" + name + '/' + config.fileName;
                img.onload = function () {
                    console.log('DONE IMAGE');
                };

                img.addEventListener('click', function (e) {
                    if (wrapper.domHasClass('active')) {
                        wrapper.domRemoveClass('active');
                    } else {
                        wrapper.domAddClass('active');
                    }
                });

                wrapper.appendChild(img);
                wrapper.appendChild(shotOptsPanel.getPanel(config, trade, main));
                main.imgContainer.node.appendChild(wrapper);
            } else {
                wrapper = domOpts.createElement('div', name + config.fileName, 'hidden shot');

                img.src = "/resources/shoots/" + name + '/' + config.fileName;
                img.onload = function () {
                    console.log('DONE IMAGE');
                };
                img.addEventListener('click', function (e) {
                    if (wrapper.domHasClass('active')) {
                        wrapper.domRemoveClass('active');
                    } else {
                        wrapper.domAddClass('active');
                    }
                });

                wrapper.appendChild(img);
                // TODO use custom pannel
                // TODO fileName with big_ is passed - when creating new image with big the filename is wrong.
                wrapper.appendChild(shotOptsPanel.getPanel(config, trade, main));
                main.imgContainer.node.appendChild(wrapper);
            }

        };


        canny.cannyParse.apply(this, [node, 'shoot', function () {
            console.log('PARSE ViewShootModule DONE', this);
        }]);
    }

    var trade, // saves the connection
        res = {
            sendPicture : function (stream) {
                console.log('GTE A NEW PICTURE', stream);
            }
        },
        fc = {
            openSocketConnection : function (cb) {
                // open connection
                d.on('remote', function (server) {
                    trade = server;
                    console.log('GET THE SERVER: ', server);

                    trade.setupClient(res, function () {
                        cb();
                    });
                });
                d.pipe(stream).pipe(d);
            }
        },
        viewModules = {};


    return {
        add : function (node, attr) {
            viewModules[attr] = new ViewShootModule(node, attr);
        },
        ready : function () {
            fc.openSocketConnection(function () {
                console.log('Connection is open');
            });
        }
    };
}());

module.exports = shooter;