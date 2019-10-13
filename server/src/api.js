const { Router } = require('express');
const { ExecutionQueue } = require('./execution-queue');

module.exports = (store, repo) => {
  const queue = new ExecutionQueue(store, repo);

  const apiRouter = Router();

  apiRouter.post('/notify_agent', (req, res) => {
    console.log({ notify: req.body });
    const { host, port } = req.body;
    queue.registerAgent(host, port);
    res.sendStatus(200);
  });

  apiRouter.post('/notify_build_result', (req, res) => {
    console.log({ notify_build_result: req.body });
    const result = req.body;
    queue.registerResult(result.id, result);
    res.sendStatus(200);
  });

  apiRouter.post('/build', (req, res) => {
    const task = req.body;
    console.log({ task });
    const id = store.registerTask({ status: 'registered', ...task });
    const job = queue.startBuild(id, task);
    job.done.then(result => {
      const status =
        typeof result.status === 'undefined' || result.status
          ? 'error'
          : 'success';
      store.updateTask(id, { status: `done(${status})`, result });
    });
    res.status(201).json({ id: job.id });
  });

  return apiRouter;
};
