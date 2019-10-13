exports.notFoundHandler = function notFoundHandler() {
  // Catch 404 and forward to error handler
  return function(req, res, next) {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  };
};
