/* jshint -W117 */
const rendering = require('../src/rendering');

describe('toXML', () => {
  test('no data', () => {
    const res = rendering({beautify: false}).toXML({}, 0, 0);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"/>');
  });
  test('sample svg data', () => {
    const res = rendering({beautify: false}).toXML({
      'circle': {
        '_attributes': {
          'cx': 50,
          'cy': 50,
          'r': 50
        }
      }
    }, 100, 100);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>');
  });
});

describe('compute', () => {
  test('no nodes no links', () => {
    const res = rendering({beautify: true}).compute({}, []);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"/>');
  });
});