/**
 * Created by han on 11.04.14.
 */
var domOpts = require('dom-opts'),
    canny = require('canny');
var showAsOverlay = (function () {
    "use strict";

    var wrapper = domOpts.createElement('div', 'overlayWrapper'),
        closeBtn = domOpts.createElement('div', null, 'closeButton octicon octicon-remove-close'),
        getPageHeight = function () {
            var body = document.getElementsByTagName('body')[0],
                html = document.getElementsByTagName('html')[0];
                return Math.max(body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight);
        },
        handlePageDimensions = function () {
            wrapper.style.height = getPageHeight() + 'px';
        },
        fadeOut = function (node, cb) {
            var opacity = node.style.opacity || 1,
                fade = function (op) {
                    if (op > 0) {
                        node.style.opacity = op;

                        setTimeout(function () {
                            fade(op - 0.1);
                        }, 30);
                    } else {
                        node.style.display = 'none';
                        cb();
                    }
                };
            fade(opacity);
            console.log('fadeOut', node);
        },
        fadeIn = function (node, cb) {
            var opacity = node.opacity || 0,
                fade = function (op) {
                    if (op <= 1) {
                        node.style.opacity = op;
                        setTimeout(function () {
                            fade(op + 0.1);
                        }, 30);
                    } else {
                        cb();
                    }
                };
            if (node.style.display === 'none') {
                node.style.opacity = opacity;
                node.style.display = '';
                fade(opacity);
            } else {
                node.style.opacity = 1;
                console.log('fadeIn', node);
            }
        },
        closeCb = function () {},
        closeView = function (e) {
            if (e.srcElement === this) {
                fadeOut(wrapper, function () {
                    console.log('WRAPPER FADE OUT');
//                    ([].slice.call(wrapper.children)).forEach(function (n) {n.domRemove(); });
                    closeCb();
                    closeCb = function () {};
                });
            }
        };

    wrapper.style.display = 'none';
    wrapper.appendChild(closeBtn);
    wrapper.addEventListener('click', closeView);
    closeBtn.addEventListener('click', closeView);
    canny.ready(function () {
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(wrapper);
    });

    return {
        show : function (node, onClose) {
            closeCb = onClose;
            wrapper.domAppendChild(node);
            wrapper.style.height = 'auto';
            fadeIn(wrapper, function () {
                console.log('WRAPPER FADE IN');
                handlePageDimensions();
            });
        },
        close : closeView
    };
}());

module.exports = showAsOverlay;