var domOpts = require('dom-opts'),
    showAsOverlay = require('./showAsOverlay.js');

/**
 * Canny module shooter
 */
var singleOptsPanel = (function () {
    "use strict";

    var panels = {
        reShot : function (initObj, cbFuntions) {
            // TOOD clean up container first
            var node = domOpts.createElement('div', null, 'reShot octicon octicon-issue-reopened');
            node.setAttribute('title', 'Take shot again: ');
            node.addEventListener('click', function () {
                cbFuntions.takeShot();
            });
            return node;
        },
        showURL : function (conf) {
            var p = domOpts.createElement('p', null, 'showURL'),
                a = domOpts.createElement('a'),
                span = domOpts.createElement('span'),
            // TODO improve http[s] check
                url = /http/.test(conf.url) ? conf.url : 'http://' + conf.url;
            a.setAttribute('title', 'open: ' + url);
            a.addEventListener('click', function () {
                window.open(url, '_blank');
            });
            a.innerHTML = url;
            p.appendChild(a);
            if (conf.desc) {
                span.innerHTML = conf.desc;
                p.appendChild(domOpts.createElement('br'));
                p.appendChild(span);
            }
            return p;
        },
        linkToUrl : function (conf) {
            var node = domOpts.createElement('div', null, 'linkToPage octicon octicon-link-external'),
            // TODO improve http[s] check
                url = /http/.test(conf.url) ? conf.url : 'http://' + conf.url;
            node.setAttribute('title', 'open: ' + url);
            node.addEventListener('click', function () {
                window.open(url, '_blank');
            });
            return node;
        },
        showBig : function (src, fileName) {
            var node = domOpts.createElement('div', null, 'showBig octicon octicon-screen-full');
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
        deleteShot : function (conf, cbFuntions) {
            var node = domOpts.createElement('div', null, 'deleteShot octicon octicon-diff-removed');
            node.setAttribute('title', 'Delete this shot: ' + conf.url);
            node.addEventListener('click', function () {
                var dec = window.confirm('This shot will be deleted!\nAre you sure?');
                if (dec) {
                    cbFuntions.deleteShot();
                } else {
                    console.log('Not deleted');
                }
            });
            return node;
        }
    };

    return {
        getPanel : function (config, cbFuntions) {
            var root = domOpts.createElement('div', null, 'optPanel');
            root.appendChild(panels.deleteShot(config, cbFuntions));
            root.appendChild(panels.reShot(config, cbFuntions));
            root.appendChild(panels.showURL(config));
            root.appendChild(panels.showBig(config.srcBigPic, config.fileName));
            root.appendChild(panels.linkToUrl(config));
            return root;
        }
    };
}());

module.exports = singleOptsPanel;