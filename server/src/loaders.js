const express = require('express');
const bodyParser = require('body-parser');
const { join } = require('path');

const apiRoutes = require('./api');
const { errorHandler } = require('./error-handler');
const { notFoundHandler } = require('./not-found-handler');
const store = require('./store');

const { renderHomePage } = require('./pages/home');
const { renderTaskPage } = require('./pages/task');

module.exports = ({ app, repo }) => {
  // Health Check endpoints
  app.get('/status', (req, res) => res.sendStatus(200));
  app.head('/status', (req, res) => res.sendStatus(200));

  app.use(express.static(join(__dirname, 'client')));

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  // Load API routes
  app.use('/', apiRoutes(store, repo));

  // Normal page rendering process
  app.get('/', renderHomePage(store, repo));
  app.get('/build/:id', renderTaskPage(store));

  // Catch 404
  app.use(notFoundHandler());

  // error handler
  app.use(errorHandler());
};
