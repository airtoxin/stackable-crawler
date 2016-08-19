# stackable-crawler [![Build Status](https://travis-ci.org/airtoxin/stackable-crawler.svg?branch=master)](https://travis-ci.org/airtoxin/stackable-crawler)

middleware based lightweight crawler framework.

## Features

+ Customizable pre-request, pre-process middleware stacks (it enables to log, cache, normalize, etc...)
+ Cancelable crawler
+ Customizable caching strategy
+ Parallel crawling
+ Pause/Resume crawling (it enables to sleep crawler)
+ Error handling (it enables to retry)

## Install

`$ npm i -S stackable-crawler`

## QuickStart

```js
import StackableCrawler, {
  CancelRequest
} from 'stackable-crawler';

const crawler = new StackableCrawler({
  prerequest: [
    options => {
      console.log('options:', options);
      return options;
    }
  ],
  processor([response, body]) {
    return new Promise((resolve, reject) => {
      saveFileFunction(body, error => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
});

crawler.on('error', (error, url) => {
  console.error(error, url);
});

crawler.add('https://github.com/');
```

### What can I do in `prerequest`?

`prerequest` middlewares stack can have sideeffect about requesting options. `options` is [request](https://github.com/request/request) module's request option. If prerequest middleware throw `CancelRequest` error, to request to that url was canceled.

### What can I do in `preprocess`?

`preprocess` middlewares stack can have sideeffect about response, body, requestOptions. They are also from [request](https://github.com/request/request).

### Friendly crawler?

Use sleep function

```js
const sleepCrawler = (crawler, sleepTime, interval) => {
  setTimeout(() => {
    crawler.stop();
    crawler.once('stopped', () => {
      setTimeout(() => crawler.start(), sleepTime);
    });
  }, interval);
}
```

## Documents

### StackableCrawler class (Default export)

Class of crawler. Extends EventEmitter3.

#### constructor

Take one argument, configure object.

```js
{
  concurrency: 1, // max # of parallel crawling
  prerequest: [], // prerequest middleware functions
  requestCache() {}, // cache strategy
  preprocess: [], // preprocess middleware functions
  processor() {}, // main callback to handle crawled Document
}
```

##### prerequest middleware

Function that process `requestOption`s. Default argument is `{ uri: url }`. Function must return new (mutated) requestOptions or Promise[requestOptions].

##### requestCache function

Function that returns cached value or `undefined`. Type of cached value is T or Promise[T]. If cached value returned, crawler pass through that values to processor function. If undefined returned, crawler fetch document as usual.

##### preprocess middleware

Function that process `[response, body, requestOptions]`. `response` and `body` are fetching result of [request](https://github.com/request/request) module. It also return new argument or Promise.

##### processor function

Main function. You can do everything here. It can return promise.

#### crawler#add(url)

Add url to crawling task queue.

#### crawler#stop()

Pause crawler. If crawler has one more running tasks, these are still running until finished, but no more run new task.

#### crawler#start()

Resume crawler if paused.

#### crawler#on(), crawler#once(), ...

These methods are inherit from EventEmitter3.

available event and args

+ event: `error`, args: `[error, url]`
+ event: `stopped`

### CancelRequest class (Named export)

Error class. If crawler throws CancelRequest error `throw new CancelRequest()`, crawler stop to request that url with no error.

### middlewares object (Named export)

Bundled simple middlewares.

#### middlewares.filterUrl

Filter only valid url. If url is invalid, this middleware throw CancelRequest error.

#### middlewares.urlCache

Function that returns simple in memory cache middleware. Do `urlCache()` when use. If requesting url was already cached, this middleware throw CancelRequest error.

#### middlewares.logger

Very simple console.log middleware

#### middlewares.body2cheerio

Replace body to cheerio object (`$`). Next middlewares and processor call with `[response, $, requestOptions]`

## License

MIT
