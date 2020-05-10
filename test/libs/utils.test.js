const {Utils} = require('../../libs/utils');

test('invalid url', () => {
  const url = 'http::::::/aaa';
  expect(() => {
    Utils.stringIsAValidUrl(url);
  }).toThrow(url);
});
test('valid url', () => {
  const url = 'https://www.monotalk.xyz';
  expect(Utils.stringIsAValidUrl(url)).toBe(true);
});
