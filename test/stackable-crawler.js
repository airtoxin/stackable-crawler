/* eslint-disable no-underscore-dangle */
import 'babel-polyfill';
import assert from 'assert';
import is from 'is'; // eslint-disable-line
import { IncomingMessage } from 'http';
import StackableCrawler from '../src/stackable-crawler';
import { CancelRequest } from '../src/exceptions';


describe(__filename, () => {
  describe('Default export', () => {
    it('should be a class', () => {
      assert.ok(is.function(StackableCrawler));
      const crawler = new StackableCrawler();
      crawler.on('error', assert.fail);
      assert.ok(crawler instanceof StackableCrawler);
    });

    it('should fetch added url', () => new Promise(done => {
      const crawler = new StackableCrawler({
        processor([response, body]) {
          return new Promise(resolve => {
            assert.ok(response instanceof IncomingMessage);
            assert.strictEqual(response.statusCode, 200);
            assert.ok(body.indexOf('<html>') !== -1);
            assert.ok(body.indexOf('</html>') !== -1);
            resolve([response, body]);
          }).then(() => done());
        },
      });

      crawler.add('http://example.com/');
    }));

    it('should be able to handle error when fetch failed', () => new Promise(done => {
      const crawler = new StackableCrawler();

      crawler.on('error', (error, url) => {
        assert.ok(error instanceof Error);
        assert.strictEqual(url, 'example.com');
      });

      crawler.on('done', done);
      crawler.add('example.com');
    }));

    it('should be able to handle done event when all tasks has done', () => new Promise(done => {
      const crawler = new StackableCrawler();

      crawler.on('done', done);
      crawler.add('http://example.com/');
    }));

    it('should fold prerequest middlewares with no concern for its type is T or Promise[T]',
    () => new Promise(done => {
      let counts = 0;
      const crawler = new StackableCrawler({
        prerequest: [
          options => {
            counts++;
            return options;
          },
          options => new Promise(resolve => {
            counts++;
            setTimeout(resolve(options), 10);
          }),
          options => {
            counts++;
            return options;
          },
        ],
        processor() {
          assert.strictEqual(counts, 3);
        },
      });

      crawler.on('done', done);
      crawler.add('http://example.com/');
    }));

    it('should fold preprocess middlewares with no concern for its type is T or Promise[T]',
    () => new Promise(done => {
      let counts = 0;
      const crawler = new StackableCrawler({
        preprocess: [
          args => {
            counts++;
            return args;
          },
          args => new Promise(resolve => {
            counts++;
            setTimeout(resolve(args), 10);
          }),
          args => {
            counts++;
            return args;
          },
        ],
        processor() {
          assert.strictEqual(counts, 3);
        },
      });

      crawler.on('done', done);
      crawler.add('http://example.com/');
    }));

    it('should run processor function when its type is Promise[T]', () => new Promise(done => {
      const crawler = new StackableCrawler({
        processor() {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 10);
          });
        },
      });

      crawler.on('done', done);
      crawler.add('http://example.com/');
    }));

    it('should be able to cancel request by throw CancelRequest error', () => new Promise(done => {
      const crawler = new StackableCrawler({
        prerequest: [
          options => {
            assert.deepEqual(options, { uri: 'hogeurl' });
            throw new CancelRequest();
          },
        ],
        preprocess: [
          () => {
            assert.fail();
          },
        ],
        processor() {
          assert.fail();
        },
      });

      crawler.on('done', done);
      crawler.on('error', assert.fail);
      crawler.add('hogeurl');
    }));

    it('should stop requesting except already requested when stop method called',
    () => new Promise(done => {
      const crawler = new StackableCrawler({
        processor() {
          return new Promise(resolve => {
            setTimeout(() => {
              assert.strictEqual(crawler._queue.q.length, 9);
              resolve();
              done();
            }, 100);
          });
        },
      });

      // eslint-disable-next-line no-unused-vars
      for (const x of Array(10)) {
        crawler.add('http://example.com/');
      }
      // fetch 1 document
      setTimeout(() => crawler.stop(), 0);
      crawler.on('error', assert.fail);
    }));

    it('should start requesting when crawler stopped and then start method called',
    () => new Promise(done => {
      const crawler = new StackableCrawler();
      crawler.stop();
      crawler.on('error', assert.fail);

      // eslint-disable-next-line no-unused-vars
      for (const x of Array(10)) {
        crawler.add('http://example.com/');
      }

      setTimeout(() => {
        // crawler is stopping
        assert.strictEqual(crawler._queue.q.length, 10);

        crawler.start();
        // fetch 1 url
        setTimeout(() => {
          crawler.stop();

          setTimeout(() => {
            assert.strictEqual(crawler._queue.q.length, 9);
            done();
          }, 100);
        }, 0);
      }, 10);
    }));

    it('should be able to handle stopped event when crawler is completely stopped',
    () => new Promise(done => {
      const crawler = new StackableCrawler();
      crawler.stop();
      crawler.on('error', assert.fail);

      // eslint-disable-next-line no-unused-vars
      for (const x of Array(10)) {
        crawler.add('http://example.com/');
      }

      crawler.start();
      // fetch 1 url
      setTimeout(() => {
        crawler.stop();
        crawler.on('stopped', () => {
          assert.strictEqual(crawler._queue.q.length, 9);
          assert.strictEqual(crawler._queue._runningTaskCount, 0);
          done();
        });
      }, 0);
    }));
  });
});
