const posthtml = require('posthtml');
const expressions = require('posthtml-expressions');
const extend = require('posthtml-extend');
const { readFileSync } = require('fs');
const { resolve, join } = require('path');

exports.renderHomePage = function(store, repo) {
  const html = readFileSync(resolve(join(__dirname, 'home.html')));

  return (req, res, next) => {
    const tasks = store.tasks;
    console.log({ tasks });
    const plugins = [extend(), expressions({ locals: { tasks, repo } })];
    posthtml(plugins)
      .process(html)
      .then(result => res.send(result.html), next);
  };
};
