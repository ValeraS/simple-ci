const nanoid = require('nanoid');

class Store {
  constructor() {
    this._tasks = [];
    this._idToTasks = new Map();
  }

  registerTask(task) {
    const id = nanoid();
    this._addTask(id, task);
    return id;
  }

  updateTask(id, newTask) {
    const task = this.getTask(id);
    this._setTask(id, { ...task, ...newTask });
  }

  get tasks() {
    return this._tasks;
  }

  getTask(id) {
    const index = this._idToTasks.get(id);
    if (typeof index === 'undefined') {
      return null;
    }
    return this._tasks[index];
  }

  _setTask(id, task) {
    let index = this._idToTasks.get(id);
    if (typeof index === 'undefined') {
      this._addTask(id, task);
    }
    this._tasks[index] = task;
  }

  _addTask(id, task) {
    this._idToTasks.set(id, this._tasks.push({ id, ...task }) - 1);
  }
}

module.exports = new Store();
