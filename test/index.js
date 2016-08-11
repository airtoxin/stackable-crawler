import 'babel-polyfill';
import assert from 'assert';
import is from 'is'; // eslint-disable-line
import StackableCrawler, { middlewares, CancelRequest } from '../src/index';


describe(__filename, () => {
  describe('Default exports', () => {
    it('should be a class', () => {
      assert.ok(is.function(StackableCrawler));
    });
  });

  describe('Named exports', () => {
    it('should exports middlewares object', () => {
      assert.ok(is.object(middlewares));
    });

    it('should exports CancelRequest exception', () => {
      assert.ok(is.function(CancelRequest));
    });
  });
});
