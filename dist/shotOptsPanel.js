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
                // TOOD improve http[s] check
                url = /http/.test(conf.url) ? conf.url : 'http://' + conf.url;
            node.setAttribute('title', 'open: ' + url);
            node.addEventListener('click', function () {
                window.open(url, '_blank');
            });
            return node;
        },
        showBig : function (elem) {
            var node = domOpts.createElement('div', null, 'showBig');
            node.setAttribute('title', 'Show big view');
            node.addEventListener('click', function () {
                console.log('SHOW BIG');
                var node = document.getElementById(elem),
                    parent = node.parentNode;
                if (node) {
                    showAsOverlay.show(node, function () {
                        parent.appendChild(node);
                    });
                }
            });
            return node;
        }
    };

    return {
        getPanel : function (config, trade, viewShootModule) {
            var root = domOpts.createElement('div', null, 'optPanel');
            root.appendChild(panels.linkToUrl(config));
            root.appendChild(panels.showBig(viewShootModule.id + 'big_' + config.fileName));
            root.appendChild(panels.reShot(config, trade, viewShootModule));
            return root;
        }
    };
}());

module.exports = shotOptsPanel;