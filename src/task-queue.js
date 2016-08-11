import EventEmitter from 'eventemitter3';

export default class TaskQueue extends EventEmitter {
  constructor(concurrency = 1) {
    super();

    this.q = [];
    this.concurrency = concurrency;
    this.running = true;

    this._runningTaskCount = 0;
  }

  enqueue(task) {
    this.q.push(task);

    this._dequeue();
  }

  start() {
    this.running = true;

    this._dequeue();
  }

  stop() {
    this.running = false;
  }

  async _dequeue() {
    if (this._runningTaskCount === this.concurrency) return;
    if (!this.running) return;
    if (this.q.length === 0) return;

    const task = this.q.shift();

    this._runningTaskCount++;

    if (this._runningTaskCount < this.concurrency) this._dequeue();

    await task().then(() => this._postDequeue()).catch(e => {
      this._postDequeue();
      this.emit('error', e);
    });
  }

  _postDequeue() {
    this._runningTaskCount--;
    if (this._runningTaskCount < this.concurrency) this._dequeue();
    if (this._runningTaskCount === 0 && this.running === false) this.emit('stopped');
    if (this.q.length === 0) this.emit('empty');
  }
}
