var canny = require('canny'),
    shoe = require('shoe'),
    dnode = require('dnode');

var stream = shoe('/shot');
var d = dnode();

// made canny public
window.canny = canny;

canny.add('clientShots', (function () {
    "use strict";
    var trade,
        root,
        img = null,
        res = {
            sendPicture : function (stream) {
                console.log('GTE A NEW PICTURE', stream);
            }
        },
        fc = {
            showImage : function (obj) {
                console.log('SHOW THE IMAGEs');
                var id = obj.id, src = obj.data;
//                    actualImg = document.getElementById(id);
//
//                if (actualImg !== null) {
//                    actualImg.domRemoveClass('hidden');
//                } else {

                if (!img) {
                    img = new Image();
                    img.src = "data:image/png;base64,";
                    img.onload = function () {
                        console.log('DONE IMAGE');
                    };
                    img.setAttribute('id', id);
                }
                img.src +=  src;
                root.appendChild(img);
//                }
            }
        };


    return {
        add : function (node, attr) {
            root = node;
        },
        target: function (url, cb) {
            trade.takeShot(url, function (d) {
                fc.showImage({
                    id : 'image',
                    data : d
                });
            });
        },
        ready : function () {
            // open connection
            d.on('remote', function (server) {
                trade = server;
                console.log('GET THE SERVER: ', server);

                trade.setupClient(res, function () {
                    console.log('SETUP CLIENT SUCCESS');
                });
            });
            d.pipe(stream).pipe(d);
        }
    };
}()));


canny.ready(function () {
    console.log('CANNY IS READY');
});
