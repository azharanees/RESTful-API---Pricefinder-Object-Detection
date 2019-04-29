
//Necessary imports for Node Express API

const express = require('express');
const router = express.Router();

var multer = require('multer');

//Imports for both s3 and Custom Vision

var config_1 = require("./config");
var fileHelpers = require("./fileHelpers");
var request = require("request");
var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');

//Receiving the Image using a POST method and saving it

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({ storage: storage });

//POST method to receive the file (currently localhost) and save it to ./images

router.post('/upload', upload.single('file'), function (req, res, next) {
    //console.log(req.file);
    if (!req.file) {
        res.status(500);
        return next(err);
    }
    res.json({ fileUrl: 'http://192.168.0.7:3000/images/' + req.file.filename });

    lastUpdated();

});

//Variable which contains the last added image

var imageLocation;

//Allowing Node to search for last added image (to upload to Custom Vision and Amazon s3)

function lastUpdated() {

    const directoryPath = path.join('D:/Node-REST-API/', 'images');

    //Passing directoryPath and callback function

    fs.readdir(directoryPath, function (err, files) {

        //Error Handling

        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        //Listing all files using for Each

        var latest = 0;

        files.forEach(function (file) {

            const stats = fs.statSync(directoryPath + '/' + file);

            //Method to determine the last added image in terms of milliseconds

            if (stats.mtimeMs > latest) {
                latest = stats.mtimeMs;
                imageLocation = file;
            }
        });

        //Calling the awsUpload() function (to insert image into Amazon s3 Bucket)

        awsUpload();

    });
}

//Function awsUpload() which will upload the image to Amazon s3

function awsUpload() {

    //configuring the AWS environment
    AWS.config.update({
        accessKeyId: "AKIAIYOTGRTBNHAJOWKQ",
        secretAccessKey: "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"
    });
    var s3 = new AWS.S3();
    var filePath = "./images/" + imageLocation;

    //Configuring Parameters
    var params = {
        Bucket: 'pricefinder-bucket',
        Body: fs.createReadStream(filePath),
        Key: "images/" + Date.now() + "_" + path.basename(filePath)
    };

    //Uploading to s3 Bucket
    s3.upload(params, function (err, data) {
        //if an error occurs, handle it
        if (err) {
            console.log("Error", err);
        }
        if (data) {
            console.log();
            console.log("Uploaded in:", data.Location);
            console.log();
        }
    });

    customVision();

}

//Function customVision() which will upload the image to Custom Vision and retrieve the probability results

function customVision() {

    //Analyzation of Image using Azure Custom Vision

    analyzeImage("'" + imageLocation + "'");
    function analyzeImage(fileName) {
        var requestOptions = {
            uri: config_1.config.vision.endpoint,
            headers: {
                "Content-Type": "application/octet-stream",
                "Ocp-Apim-Subscription-Key": config_1.config.vision.key1,
                "Prediction-Key": config_1.config.vision.key1
            },
            body: fileHelpers.readImage('D:/Node-REST-API/images' + '/' + imageLocation)
        };
        request.post(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Error: ', err);
                return;
            }

            //Determination and calculation of percentage probabilities

            var jsonResponse = JSON.parse(body);
            console.log(jsonResponse);
            var count = Object.keys(jsonResponse.predictions).length;
            var highest = 0;
            var i;
            for (i = 0; i < count; i++) {
                if (jsonResponse.predictions[i].probability >= highest) {
                    highest = jsonResponse.predictions[i].probability;
                }
            }

            //Displaying of the highest determined percentage probability

            console.log();
            console.log("Highest Cracked Percentage Probability : " + highest);
        });
    }

}

module.exports = router;