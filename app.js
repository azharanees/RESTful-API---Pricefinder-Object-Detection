const express = require('express');
const app = express();
const morgan = require('morgan');

const imageRoutes = require('./api/routes/index');

app.use(morgan('dev'));

app.use('/api/', imageRoutes);

module.exports = app;