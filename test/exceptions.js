import 'babel-polyfill';
import assert from 'assert';
import is from 'is'; // eslint-disable-line
import { CancelRequest } from '../src/exceptions';


describe(__filename, () => {
  describe('CancelRequest', () => {
    it('should be a class extends Error', () => {
      assert.ok(is.function(CancelRequest));
      const error = new CancelRequest();
      assert.ok(error instanceof CancelRequest);
      assert.ok(error instanceof Error);
    });
  });
});
