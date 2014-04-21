var canny = require('canny');


window.canny = canny;

canny.add('coverFlow', require('./js/coverFlow.js'));
canny.add('clientShooter', require('../../dist/clientSlideShoots.js'));


canny.ready(function () {
    "use strict";

});