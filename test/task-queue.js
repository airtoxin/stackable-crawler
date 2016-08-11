import 'babel-polyfill';
import assert from 'assert';
import is from 'is'; // eslint-disable-line
import TaskQueue from '../src/task-queue';


describe(__filename, () => {
  describe('Default export', () => {
    it('should be a class', () => {
      assert.ok(is.function(TaskQueue));
      const q = new TaskQueue();
      assert.ok(q instanceof TaskQueue);
    });

    describe('enqueue()', () => {
      it('should resolve queued task synchronously when task is synchronous', () => {
        const q = new TaskQueue();

        let passed = false;
        const task = () => {
          passed = true;
        };

        q.enqueue(task);

        assert.ok(passed);
      });

      it('should resolve queued task asynchronously when task is asynchronous',
      () => new Promise(done => {
        const q = new TaskQueue();

        let passed = false;
        const task = () => setTimeout(() => {
          passed = true;
        }, 0);

        q.enqueue(task);

        setTimeout(() => {
          assert.ok(passed);
          done();
        }, 10);
      }));
    });

    describe('start()/stop()', () => {
      it('should change queue running status to true', () => {
        const q = new TaskQueue();

        q.running = false;

        q.start();

        assert.strictEqual(q.running, true);
      });

      it('should change queue running status to false', () => {
        const q = new TaskQueue();

        assert.strictEqual(q.running, true);

        q.stop();

        assert.strictEqual(q.running, false);
      });

      it('should not run queued tasks when queue stopped, and run tasks when queue started',
      () => new Promise(done => {
        const q = new TaskQueue();
        q.stop();

        const task = () => new Promise(resolve => {
          setTimeout(resolve, 1);
        });
        // eslint-disable-next-line no-unused-vars
        for (const x of Array(10)) {
          q.enqueue(task);
        }

        assert.strictEqual(q.q.length, 10);

        q.start();

        setTimeout(() => {
          assert.strictEqual(q.q.length, 0);
          done();
        }, 100);
      }));
    });

    describe('empty event', () => {
      it('should emited when queue will be empty', () => new Promise(done => {
        const q = new TaskQueue();
        q.on('empty', done);

        const task = () => new Promise(resolve => {
          setTimeout(resolve, 10);
        });
        // eslint-disable-next-line no-unused-vars
        for (const x of Array(10)) {
          q.enqueue(task);
        }
      }));
    });

    describe('error event', () => {
      it('should emited when task throws Error', () => new Promise(done => {
        const q = new TaskQueue();
        q.on('error', done);

        q.enqueue(() => Promise.reject());
      }));
    });

    describe('concurrency', () => {
      it('should be set by constructor arguments', () => {
        const q = new TaskQueue(5);

        assert.strictEqual(q.concurrency, 5);
      });

      it('ran queued tasks in parallel', () => new Promise(done => {
        // 10000 parallels
        const q = new TaskQueue(10000);

        q.stop();

        const task = () => new Promise(resolve => {
          setTimeout(resolve, 10);
        });
        // eslint-disable-next-line no-unused-vars
        for (const x of Array(10000)) {
          q.enqueue(task);
        }

        assert.strictEqual(q.q.length, 10000);
        q.start();

        setTimeout(done, 500);
      }));
    });
  });
});
