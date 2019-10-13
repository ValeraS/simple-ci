const bodyParser = require('body-parser');

const apiRoutes = require('./api');
const { errorHandler } = require('./error-handler');
const { notFoundHandler } = require('./not-found-handler');

module.exports = ({ app, ...opts }) => {
  // Health Check endpoints
  app.get('/status', (req, res) => res.sendStatus(200));
  app.head('/status', (req, res) => res.sendStatus(200));

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  // Load API routes
  app.use('/', apiRoutes(opts));

  // Catch 404
  app.use(notFoundHandler());

  // error handler
  app.use(errorHandler());
};
