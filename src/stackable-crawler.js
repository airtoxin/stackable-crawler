import EventEmitter from 'eventemitter3';
import Queue from './task-queue';
import request from './request';
import { CancelRequest } from './exceptions';

const defaultOptions = {
  concurrency: 1,
  prerequest: [],
  requestCache() {},
  preprocess: [],
  processor: Promise.resolve,
};

function reduceMiddlewares(middlewares, args) {
  return middlewares.reduce((p, mw) => p.then(mw), Promise.resolve(args));
}

export default class StackableCrawler extends EventEmitter {
  constructor(options = {}) {
    super();

    this._options = Object.assign({}, defaultOptions, options);
    this._queue = new Queue(this._options.concurrency);
    this._queue.on('stopped', () => this.emit('stopped'));
    this._queue.on('empty', () => this.emit('done'));
  }

  add(url) {
    this._queue.enqueue(this._createAsyncTask(url));
  }

  stop() {
    this._queue.stop();
  }

  start() {
    this._queue.start();
  }

  async applyMiddlewarePrerequest(url) {
    return await reduceMiddlewares(this._options.prerequest, { uri: url });
  }

  _createAsyncTask(url) {
    return async () => {
      try {
        const requestOptions = await this.applyMiddlewarePrerequest(url);
        const cached = await this._options.requestCache(requestOptions);
        // eslint-disable-next-line no-unneeded-ternary
        const results = cached ? cached : await request(requestOptions);
        const mwResults = await reduceMiddlewares(this._options.preprocess, results);
        await this._options.processor(mwResults);
      } catch (e) {
        if (e instanceof CancelRequest) return;

        this.emit('error', e, url);
      }
    };
  }
}
