Run the following commands in a Command Prompt or shell:

npm install

These already exists in dependencies, so they won`t be necessary

npm install express
npm install --save multer 
npm install nodemon (For real-time updation of localhost server)
npm i react-native-aws3 (Connection to S3)
npm install fs
npm install request (may not be necessary)

Comments have been placed in order to make everything understandable.
After installing nodemon, use npm start to deploy localhost.

Use POSTMAN to send a POST request containing an image file to 'localhost:3000/api/upload'
The image will then be inserted into s3 and then sent to Custom Vision
