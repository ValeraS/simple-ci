const posthtml = require('posthtml');
const expressions = require('posthtml-expressions');
const extend = require('posthtml-extend');
const { readFileSync } = require('fs');
const { resolve, join } = require('path');

exports.renderTaskPage = function(store) {
  const html = readFileSync(resolve(join(__dirname, 'task.html')));
  return (req, res, next) => {
    const task = store.getTask(req.params.id);
    if (!task) {
      return res.status(404).send('not found');
    }
    console.log({ task });
    const plugins = [
      extend(),
      expressions({ locals: { result: {}, ...task } }),
    ];
    posthtml(plugins)
      .process(html)
      .then(result => res.send(result.html), next);
  };
};
