import Nightmare from "nightmare";
import EventEmitter from "eventemitter3";
import Queue from './task-queue';

const defaultOptions = {
  nightmare: {},
  setup: []
};

function reduceMiddlewares(middlewares, args) {
  return middlewares.reduce((p, mw) => p.then(mw), Promise.resolve(args));
}

export default class NightmareCrawler extends EventEmitter {
  constructor(options={}) {
    super();

    this._options = {...options, defaultOptions};
    this._queue = new Queue(this._options.concurrency);
  }

  add(url) {
    this._queue.enqueue(this._createAsyncTask(url));
  }

  _createAsyncTask(url) {
    return async () => {
      try {
        const _n = new Nightmare(this._options.nightmare);
        const nightmare = await reduceMiddlewares(this._options.setup, _n.goto(url));
        console.log("@nightmare", nightmare);
        const returns = await nightmare.end();
        console.log("@returns", returns);
      } catch(e) {
        if (e instanceof CancelRequest) return;

        this.emit('error', e, url);
      }
    }
  }
}
