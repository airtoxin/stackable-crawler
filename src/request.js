import req from 'request';

export default function request(option) {
  return new Promise((resolve, reject) => {
    req(option, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve([response, body, option]);
      }
    });
  });
}
