const fetch = require('node-fetch');

class ExecutionQueue {
  constructor(store, repo, opts = {}) {
    this._store = store;
    this._repo = repo;
    this._agents = [];
    this._jobs = [];
    this._executingJobs = new Map();
    this._healthCheckInterval = opts.healthCheckInterval || 10000;
    this._maxRetry = opts.maxRetry || 3;
  }

  async registerAgent(host, port) {
    if (
      this._agents.findIndex(
        agent => agent.host === host && agent.port === port
      ) !== -1
    ) {
      return;
    }
    console.log({ register_agent: { host, port } });
    if (await this._healthCheck({ host, port })) {
      this._agents.push({ host, port });
      this._schedule();
    }
  }

  startBuild(id, { hash, command }) {
    console.log({ start_build: { id, hash, command } });
    const result = this._queueJob({
      id,
      hash,
      command,
      retry: 0,
    });
    return { id, done: result.done };
  }

  registerResult(id, result) {
    console.log({ register_result: { id } });
    const jobResult = this._executingJobs.get(id);
    if (jobResult) {
      this._executingJobs.delete(id);
      jobResult({ result });
    }
  }

  _queueJob(job) {
    const result = deferred();
    this._jobs.push([job, result.resolve]);
    this._store.updateTask(job.id, { status: 'queued' });
    this._schedule();
    return result;
  }

  async _healthCheck({ host, port }) {
    try {
      console.log(`http://${host}:${port}/status`);
      const res = await fetch(`http://${host}:${port}/status`, {
        method: 'HEAD',
      });
      if (res.status < 200 || res.status >= 300) {
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  _checkAgent({ host, port }, callback) {
    return async () => {
      if (!(await this._healthCheck({ host, port }))) {
        callback({ err: new Error(`Agent ${host}:${port} does not answer.`) });
      }
    };
  }

  _startJob({ host, port }, job) {
    console.log({ start_job: job });
    const result = deferred();
    fetch(`http://${host}:${port}/build`, {
      method: 'POST',
      body: JSON.stringify({ repo: this._repo, ...job }),
      headers: { 'Content-Type': 'application/json' },
    }).then(
      res => {
        if (res.status < 200 || res.status >= 300) {
          result.resolve({
            err: new Error(`Something went wrong (${result.status})`),
          });
        }
      },
      err => result.resolve({ err })
    );
    this._store.updateTask(job.id, { status: 'running' });
    return result;
  }

  _schedule() {
    if (this._jobs.length === 0 || this._agents.length === 0) {
      console.log('wait for work', {
        jobs: this._jobs.length,
        agents: this._agents.length,
      });
      return;
    }

    const [job, callback] = this._jobs.shift();
    const agent = this._agents.shift();

    const result = this._startJob(agent, job);

    this._executingJobs.set(job.id, result.resolve);

    const timerId = setInterval(
      () => this._checkAgent(agent, result.resolve),
      this._healthCheckInterval
    );

    const jobResult = result.done.then(({ err, result }) => {
      clearInterval(timerId);
      this.registerAgent(agent.host, agent.port);

      if (err) {
        if (job.retry < this._maxRetry) {
          job.retry++;
          // retry one more time
          return this._queueJob(job);
        }

        this._executingJobs.delete(job.id);
        process.nextTick(this._schedule.bind(this));
        return { error: err };
      }

      this._executingJobs.delete(job.id);
      process.nextTick(this._schedule.bind(this));
      return result;
    });

    callback(jobResult);
  }
}

exports.ExecutionQueue = ExecutionQueue;

function deferred() {
  const d = {};
  d.done = new Promise((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });
  return d;
}
