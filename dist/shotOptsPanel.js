var domOpts = require('dom-opts'),
    showAsOverlay = require('./showAsOverlay.js');

/**
 * Canny module shooter
 */
var shotOptsPanel = (function () {
    "use strict";

    var panels = {
        reShot : function (initObj, trade, viewShootModule) {
            // TOOD clean up container first
            var node = domOpts.createElement('div', null, 'reShot');
            node.setAttribute('title', 'Take shot again: ');
            node.addEventListener('click', function () {
                trade.takeShot(initObj, viewShootModule.imgContainer.createContent);
            });
            return node;
        },
        linkToUrl : function (conf) {
            var node = domOpts.createElement('div', null, 'linkToPage'),
                // TODO improve http[s] check
                url = /http/.test(conf.url) ? conf.url : 'http://' + conf.url;
            node.setAttribute('title', 'open: ' + url);
            node.addEventListener('click', function () {
                window.open(url, '_blank');
            });
            return node;
        },
        showBig : function (src, fileName) {
            var node = domOpts.createElement('div', null, 'showBig');
            node.setAttribute('title', 'Show ' + fileName + ' as big peview');
            node.addEventListener('click', function () {
                console.log('SHOW BIG');
                var node = domOpts.createElement('div', null, 'imgBigWrapper'),
                    img = new Image();
                img.src = src;
                node.appendChild(img);

                if (node) {
                    showAsOverlay.show(node, function () {
                        console.log('CLOSE BIG');
                        node.domRemove();
                    });
                }
            });
            return node;
        },
        deleteShot : function (conf, trade) {
            var node = domOpts.createElement('div', null, 'deleteShot');
            node.setAttribute('title', 'Delete this shot: ' + conf.url);
            node.addEventListener('click', function () {
                var dec = window.confirm('This shot will be deleted!\nAre you sure?');
                if (dec) {
                    trade.deleteShot(conf, function () {
                        console.log('File remove success.');
                        // TODO save config to restore deleted screen shots
                        document.getElementById(conf.viewId).domRemove();
                    });
                } else {
                    console.log('Not deleted');
                }
            });
            return node;
        }
    };

    return {
        getPanel : function (config, trade, viewShootModule) {
            var root = domOpts.createElement('div', null, 'optPanel');
            root.appendChild(panels.linkToUrl(config));
            root.appendChild(panels.showBig(config.srcBigPic, config.fileName));
            root.appendChild(panels.reShot(config, trade, viewShootModule));
            root.appendChild(panels.deleteShot(config, trade));
            return root;
        }
    };
}());

module.exports = shotOptsPanel;