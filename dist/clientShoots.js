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
                var url = main.url.node.value,
                    delay = main.delay.node.value;

                console.log('DELAY:', delay);
                // TODO CHECK IF IMAGE IS VALID
                trade.takeShot({
                    url : url,
                    delay: delay || 0,
                    fileName: url + '.jpg',
                    category: name,
                    srcPic : null,
                    srcBigPic : null
                }, main.imgContainer.createContent);
            });
        });

        this.url = new CannyMod();
        this.delay = new CannyMod();

        this.imgContainer = new CannyMod();

        //TODO has problems with question marks (?). Fix it!
        this.imgContainer.createContent = function (config) {
            var img = new Image(),
            // TODO remove config.fileName is deprecated
                wrapper = document.getElementById(config.viewId);

            if (config) {
                if (wrapper) {
                    // delete old wrapper and replace it by new one
                    wrapper.domRemove();
                }

                // TODO refactor duplicated code

                console.log('ADD IMAGE TO CONTAINER', config);
                wrapper = domOpts.createElement('div', config.viewId, 'shot');
                img.src = config.srcPic;
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
            }
        };


        canny.cannyParse.apply(this, [node, 'shoot', function () {
            console.log('PARSE ViewShootModule DONE', this);
        }]);
    }

    var trade, // saves the connection
        viewModules = {},
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
            },
            loadModuleScreenShoots : function () {
                Object.keys(viewModules).forEach(function (name) {
                    trade.getScreenShots(name, viewModules[name].imgContainer.createContent);
                });
            }
        };


    return {
        add : function (node, attr) {
            viewModules[attr] = new ViewShootModule(node, attr);
        },
        ready : function () {
            fc.openSocketConnection(function () {
                console.log('Connection is open');
                fc.loadModuleScreenShoots();
            });
        }
    };
}());

module.exports = shooter;