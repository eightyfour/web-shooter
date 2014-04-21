var canny = require('canny'),
    shoe = require('shoe'),
    domOpts = require('dom-opts'),
    singleOptsPanel = require('./singleOptsPanel.js'),
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
        this.parent = null;
        this.add = function (node) {
            console.log('INIT CannyMod', node);
            that.node = node;
            that.parent = node.parentNode.parentNode;
            fc && fc.call(that);
        };
    }

    var selectionHandler = (function (e) {
        var cannyMods = [];

        return {
            addViewSection : function (cannyMod) {
                cannyMods.push(cannyMod);
            },
            handleEvent : function (cannyMod) {
                console.log('HANDLE EVENT', cannyMod);
                if (cannyMod.parent.domHasClass('active')) {
                    return;
                }

                cannyMods.forEach(function (cMod) {
                    var inputClass = !cMod.node.value ? 'empty' : 'checked';
                    cMod.parent.classList.add(inputClass);
                    cMod.parent.classList.remove('active');
                });

                cannyMod.parent.classList.add('active');
                cannyMod.parent.classList.remove('empty');
            }
        };
    }());

    function addOnFocusHandler(cannyMod) {
        selectionHandler.addViewSection(cannyMod);
        cannyMod.node.parentNode.parentNode.addEventListener('click', function () {
            selectionHandler.handleEvent(cannyMod);
        });
        cannyMod.node.addEventListener('focus', function (e) {
            selectionHandler.handleEvent(cannyMod);
        });
    }

    function ViewShootModule(node, name) {
        var main = this;
        this.id = name; // save name as id

        this.button = new CannyMod(function () {
            var that = this;
            this.node.addEventListener('click', function () {
                var url = main.url.node.value,
                    desc = main.desc.node.value,
                    delay = main.delay.node.value;

                // TODO CHECK IF IMAGE/URL IS VALID
                trade.takeShot({
                    url : url,
                    desc: desc || null,
                    delay: delay || 0,
                    fileName: url + '.jpg',
                    category: name,
                    srcPic : "/resources/shoots/" + name + '/' + url + '.jpg',
                    srcBigPic : "/resources/shoots/" + name + '/big/' + url + '.jpg'
                }, function (config) {
                    main.imgContainer.createContent(config);
                    canny.coverFlow.init(viewModules[name].imgContainer.node, {showLast: true});
                });
            });
        });

        this.url = new CannyMod(function () {
            addOnFocusHandler(this);
        });

        this.delay = new CannyMod(function () {
            addOnFocusHandler(this);
        });

        this.desc = new CannyMod(function () {
            addOnFocusHandler(this);
        });

        this.imgContainer = new CannyMod();

        //TODO has problems with question marks (?). Fix it!
        this.imgContainer.createContent = function (config) {
            var img = new Image(),
                wrapper = document.getElementById(config.viewId);

            if (config) {
                if (wrapper) {
                    // delete old wrapper and replace it by new one
                    wrapper.domRemove();
                }

                console.log('ADD IMAGE TO CONTAINER', config);
                wrapper = domOpts.createElement('div', config.viewId, 'shot');
                img.src = config.srcPic;
                img.onload = function () {
                    console.log('DONE IMAGE');
                };

                img.addEventListener('click', function (e) {
                    console.log('CLICK: ');
//                    if (wrapper.domHasClass('active')) {
//                        wrapper.domRemoveClass('active');
//                    } else {
//                        wrapper.domAddClass('active');
//                    }
                });

                wrapper.appendChild(img);
                wrapper.addEventListener('coverFlowActive', function () {
                    console.log('coverFlowActive', config);
                    main.navigationController.showDescription(config);
                });
//                wrapper.appendChild(shotOptsPanel.getPanel(config, trade, main));
                main.imgContainer.node.appendChild(wrapper);
            }
        };

        this.navigationController = new CannyMod();
        this.navigationController.showDescription = function (config) {
            main.navigationController.node.domEmpty();
            main.navigationController.node.appendChild(singleOptsPanel.getPanel(config, {
                deleteShot : function () {fc.deleteShot(config, main); },
                takeShot : function () {fc.takeShot(config, main); }
            }));
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
            takeShot : function (config, viewShootModule) {
                trade.takeShot(config, viewShootModule.imgContainer.createContent);
            },
            deleteShot : function (config, viewShootModule) {
                trade.deleteShot(config, function () {
                    console.log('File remove success.');
                    // TODO save config to restore deleted screen shots
                    document.getElementById(config.viewId).domRemove();
                    canny.coverFlow.init(viewShootModule.imgContainer.node);
                });
            },
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
                    trade.getScreenShots(name, viewModules[name].imgContainer.createContent, function () {
                        canny.coverFlow.init(viewModules[name].imgContainer.node);
                    });
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