import cheerio from 'cheerio';
import validUrl from 'valid-url';
import { CancelRequest } from './exceptions';

/**
 * filter only valid url
 *
 * @sideeffect: throw CancelRequest error
 */
export function filterUrl(options) {
  if (!validUrl.isWebUri(options.uri)) {
    throw new CancelRequest();
  }

  return options;
}

/**
 * simple in memory cache middleware
 *
 * @sideeffect: throw CancelRequest error
 */
export function urlCache() {
  const simpleCache = {};

  return (options) => {
    if (simpleCache[options.uri]) {
      throw new CancelRequest();
    }

    simpleCache[options.uri] = true;
    return options;
  };
}

/**
 * logger middleware
 *
 * @sideeffect: console.log arguments
 */
export function logger(...args) {
  let a = args;
  if (a.length === 1) a = a[0];
  // eslint-disable-next-line no-console
  console.log('@arguments:', a);
  return a;
}

/**
 * body2cheerio middleware
 *
 * @sideeffect: [response, body] was mutated into [response, $]
 * `$` is cheerio object
 */
export function body2cheerio([response, body, options]) {
  if (!body) return [response, body];

  return [response, cheerio.load(body), options];
}
