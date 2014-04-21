#!/bin/sh
browserify resources/main.js -o resources/main.gen.js
browserify resources/js/coverFlow.js -o resources/coverFlow.gen.js
lessc resources/css/coverFlow.less > resources/css/coverFlow.css

node app.js

