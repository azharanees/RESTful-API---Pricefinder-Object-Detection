"use strict";
exports.__esModule = true;
var fs = require("fs");
var buffer_1 = require("buffer");
function readImage(filePath) {
    var fileData = fs.readFileSync(filePath).toString("hex");
    var result = [];
    for (var i = 0; i < fileData.length; i += 2) {
        result.push(parseInt(fileData[i] + "" + fileData[i + 1], 16));
    }
    return buffer_1.Buffer.from(result);
}
exports.readImage = readImage;
