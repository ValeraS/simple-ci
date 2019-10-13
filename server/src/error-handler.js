exports.errorHandler = function errorHandler() {
  // eslint-disable-next-line no-unused-vars
  return function(err, req, res, next) {
    res.status(err.status || 500);

    if (process.env.NODE_ENV === 'production') {
      res.json({});
    } else {
      res.json({
        errors: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  };
};
