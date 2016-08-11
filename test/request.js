import 'babel-polyfill';
import assert from 'assert';
import is from 'is'; // eslint-disable-line
import { IncomingMessage } from 'http';
import request from '../src/request';


describe(__filename, () => {
  describe('Default export', () => {
    it('should be function', () => {
      assert.ok(is.function(request));
    });

    it('should request to net and then returns promise', () => new Promise(done => {
      const p = request('http://example.com/');
      assert.ok(p instanceof Promise);

      p.then(([response, body]) => {
        assert.ok(response instanceof IncomingMessage);
        assert.strictEqual(response.statusCode, 200);
        assert.ok(body.indexOf('<html>') !== -1);
        assert.ok(body.indexOf('</html>') !== -1);
        done();
      });
    }));

    it('just should wraps request module', () => new Promise(done => {
      const options = {
        method: 'GET',
        uri: 'http://www.google.com',
        har: {
          url: 'http://www.mockbin.com/har',
          method: 'POST',
          headers: [
            {
              name: 'content-type',
              value: 'application/x-www-form-urlencoded',
            },
          ],
          postData: {
            mimeType: 'application/x-www-form-urlencoded',
            params: [
              {
                name: 'foo',
                value: 'bar',
              },
              {
                name: 'hello',
                value: 'world',
              },
            ],
          },
        },
      };

      const p = request(options);
      assert.ok(p instanceof Promise);
      // eslint-disable-next-line no-unused-vars
      p.then(([response, body, opts]) => {
        assert.strictEqual(response.statusCode, 405);
        assert.deepEqual(opts, options);
        done();
      });
    }));
  });
});
