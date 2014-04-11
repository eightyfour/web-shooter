var canny = require('canny');

window.canny = canny;

canny.add('clientShooter', require('../../dist/clientShoots.js'));


canny.ready(function () {
    "use strict";

});