/* jshint -W117 */
let rendering = require('../src/rendering');
const fs = require('fs');

const solidCirclePath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z';
const regularCirclePath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z';

describe('resources fail', () => {
  beforeAll(() => {
    fs.renameSync('resources.json', 'resources.tmp.json');
    jest.resetModules();
    rendering = require('../src/rendering');
  });
  afterAll(() => {
    fs.renameSync('resources.tmp.json', 'resources.json');
    jest.resetModules();
    rendering = require('../src/rendering');
  });
  test('getIcon no resources', () => {
    const res = rendering().getIcon('regular circle');
    expect(res).toBeNull();
  });
});

describe('getIcon', () => {
  test('no name', () => {
    const res = rendering().getIcon(undefined);
    expect(res).toBeNull();
  });
  test('empty name', () => {
    const res = rendering().getIcon('  ');
    expect(res).toBeNull();
  });
  test('invalid name', () => {
    const res = rendering().getIcon('circle-2');
    expect(res).toBeNull();
  });
  test('valid circle', () => {
    const res = rendering().getIcon('circle');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512
    });
  });
  test('valid circle alt name', () => {
    const res = rendering().getIcon('fa-circle');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512
    });
  });
  test('ignored other name', () => {
    const res = rendering().getIcon('circle server');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512
    });
  });
  test('forcing regular', () => {
    const res = rendering().getIcon('far circle');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512
    });
  });
  test('forcing regular 2', () => {
    const res = rendering().getIcon('regular circle');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512
    });
  });
  test('forcing regular 3', () => {
    const res = rendering().getIcon('circle far');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512
    });
  });
  test('double type', () => {
    const res = rendering().getIcon('circle far solid');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512
    });
  });
  test('double type 2', () => {
    const res = rendering().getIcon('circle solid far');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512
    });
  });
  test('forcing solid on brands icon', () => {
    const res = rendering().getIcon('usb');
    expect(res).not.toBeNull();
    const res2 = rendering().getIcon('fas usb');
    expect(res2).toBeNull();
  });
});

describe('getBounds', () => {
  test('no nodes', () => {
    const res = rendering().getBounds({});
    expect(res).toEqual({w: 0, h: 0});
  });
  test('1 node', () => {
    const res = rendering().getBounds({
      '1': {x: 0, y: 0}
    });
    expect(res).toEqual({w: 1, h: 1});
  });
  test('3 nodes', () => {
    const res = rendering().getBounds({
      '1': {x: 0, y: 0}, '2': {x: 5, y: 2}, '3': {x: 3, y: 8},
    });
    expect(res).toEqual({w: 6, h: 9});
  });
});

describe('toXML', () => {
  test('no data', () => {
    const res = rendering({scale: 20, 'h-spacing': 1}).toXML({}, {w: 0, h: 0});
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" stroke="black" fill="black"/>');
  });
  test('sample svg data', () => {
    const res = rendering({scale: 2, 'h-spacing': 1}).toXML({
      'circle': {
        '_attributes': {
          'cx': 50,
          'cy': 50,
          'r': 50
        }
      }
    }, {w: 100, h: 100});
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500" stroke="black" fill="black"><circle cx="50" cy="50" r="50"/></svg>');
  });
});

describe('compute', () => {
  test('no nodes no links', () => {
    const res = rendering({beautify: true, 'h-spacing': 1.2, scale: 20}).compute({}, []);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" stroke="black" fill="black">\n</svg>');
  });
  test('invalid node', () => {
    try {
      rendering().compute({
        'a': {name: 'a', icon: 5}
      }, []);
      fail('no error thrown');
    } catch (err) {
      expect(err).toBe('Node \'a\' is invalid at key icon');
    }
  });
  test('invalid link', () => {
    try {
      rendering().compute({}, [{from: 'a', to: 'b', type: 5}]);
      fail('no error thrown');
    } catch (err) {
      expect(err).toBe('Link 0 (a->b) is invalid at key type');
    }
  });
});