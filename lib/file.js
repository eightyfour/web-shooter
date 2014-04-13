var fs = require('fs');

(function () {
    "use strict";

    var idSplitChar = 'x';

    function fromUTF8toString(uArr) {
        var i, arr = '';
        for (i = 0; i < uArr.length; i++) {
            arr += String.fromCharCode(uArr[i]);
        }
        return arr;
    }

    function toUTF8Array(str) {
        var i, arr = [];
        for (i = 0; i < str.length; i++) {
            arr.push(str.charCodeAt(i));
        }
        return arr;
    }

    function pathToId(path) {
        var utf8A = toUTF8Array(path);
        return utf8A.join(idSplitChar);
    }

    /**
     *
     * @type {{listDir: listDir, saveAsJSON: saveAsJSON, getJSONFile: getJSONFile}}
     */
    module.exports = {
        /**
         * Generate a id from path.
         * @param filePath
         * @returns {*}
         */
        generateFilePathId : function (filePath) {
            return pathToId(filePath);
        },
        /**
         * Read the path from a id.
         * @param id
         * @returns {*}
         */
        getFilePathFromId : function (id) {
            return fromUTF8toString(id.split(idSplitChar));
        },
        /**
         * Reads a directory and returns a obj
         * {
         *  value: [{
         *      d: [true if directory],
         *      name: [file name]
         *  }],
         *  fail: [true if failed]
         * }
         * @param path
         * @param cb
         */
        listDir : function (path, cb) {
            var res = [], count;

            console.log('readDir: ', path);
            fs.readdir(path, function (err, files) { // '/' denotes the root folder
                if (err) {cb({value : [], fail : true}); }
                count = files.length;
                if (count === 0) {
                    cb({value : [], fail : false});
                }
                files.forEach(function (file) {
                    fs.lstat(path + '/' + file, function (err, stats) {
                        if (!err) {
                            res.push({d : stats.isDirectory(), name : file});
                        } else {
                            console.log('file:readDir :: ERROR');
                        }
                        count--;
                        if (count <= 0) {
                            cb({value : res, fail : false});
                        }
                    });
                });
            });
        },
        /**
         * Saves obj as JSON in a file.
         *
         * TODO Handle if directory not exists.
         *
         * @param path
         * @param obj
         * @param cb
         */
        saveAsJSON : function (path, obj, cb) {
            fs.writeFile(path, JSON.stringify(obj), "utf8", cb || function () {});
        },
        /**
         * Reads a file. Pass false if file not found or can't read.
         * @param path
         * @param cb
         */
        getJSONFile : function (path, cb) {
            try {
                cb(require(path));
            } catch (e) {
                cb(false);
                console.log("Can't read file: " + path);
            }
        }
    };
}());