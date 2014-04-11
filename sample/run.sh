#!/bin/sh
browserify resources/main.js -o resources/main.gen.js

node app.js

