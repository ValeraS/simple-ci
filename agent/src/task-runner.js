const { spawn } = require('child_process');
const { join } = require('path');

class TaskRunner {
  constructor(cwd) {
    this._cwd = cwd;
    this._prefix = 'build';
  }

  async run(task) {
    const result = deferred();
    Promise.resolve().then(() => this._runTask(task, result.resolve));
    return result.done;
  }

  async _runTask(task, callback) {
    const { id, repo, hash, command } = task;
    const results = [];

    const repoPath = join(this._prefix, id);
    const cloneResult = await clone(repo, repoPath, this._cwd);
    results.push(cloneResult);
    if (cloneResult.status) {
      callback(this._returnResult(task, results));
      return;
    }

    const repoCwd = join(this._cwd, repoPath);

    const checkoutResult = await checkout(hash, repoCwd);
    results.push(checkoutResult);
    if (checkoutResult.status) {
      callback(this._returnResult(task, results));
      return;
    }

    const commandResult = await runCommand(command, repoCwd);
    results.push(commandResult);
    callback(this._returnResult(task, results));
    return;
  }

  _returnResult(task, results) {
    const stdOut = results.reduce((out, { stdOut }) => [...out, ...stdOut], []);
    const stdErr = results.reduce((out, { stdErr }) => [...out, ...stdErr], []);
    const status = results[results.length - 1].status;
    return {
      ...task,
      status,
      stdOut: Buffer.concat(stdOut).toString('utf-8'),
      stdErr: Buffer.concat(stdErr).toString('utf-8'),
    };
  }
}

exports.TaskRunner = TaskRunner;

function deferred() {
  const d = {};
  d.done = new Promise((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });
  return d;
}

function clone(repo, name, cwd) {
  return execute('git', ['clone', repo, name], cwd);
}

function checkout(hash, cwd) {
  return execute('git', ['checkout', '-qf', hash], cwd);
}

function runCommand(command, cwd) {
  return execute('/bin/sh', ['-c', command.replace(/\r\n/g, '\n')], cwd);
}

async function execute(command, args, cwd, env) {
  console.log({ command, args, cwd });
  const spawned = spawn(command, args.slice(0), {
    cwd,
    env,
    windowsHide: true,
  });

  const processResult = deferred();
  const stdOut = [];
  const stdErr = [];

  spawned.on('error', err => {
    stdErr.push(Buffer.from(err.stack, 'ascii'));
  });

  spawned.stdout.on('data', buffer => {
    stdOut.push(buffer);
  });

  spawned.stderr.on('data', buffer => {
    stdErr.push(buffer);
  });

  const onFinish = exitCode => {
    processResult.resolve(exitCode);
  };

  spawned.on('close', onFinish);
  spawned.on('exit', onFinish);

  return processResult.done.then(status => ({ status, stdOut, stdErr }));
}
