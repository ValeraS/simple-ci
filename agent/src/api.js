const { Router } = require('express');
const fetch = require('node-fetch');

const { TaskRunner } = require('./task-runner');

module.exports = ({ serverHost, serverPort, buildPath }) => {
  const apiRouter = Router();
  const runner = new TaskRunner(buildPath);

  apiRouter.post('/build', (req, res) => {
    const task = req.body;
    console.log({ task });
    runner.run(task).then(result =>
      sendResult(result).catch(err => {
        // server does not response
        console.error(err);
        process.exit(1);
      })
    );
    res.sendStatus(200);
  });

  return apiRouter;

  function sendResult(result) {
    console.log({ result });
    return fetch(`http://${serverHost}:${serverPort}/notify_build_result`, {
      method: 'POST',
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
