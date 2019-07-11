/* jshint -W117 */
const placing = require('../src/placing');

describe('getBounds', () => {
  test('no nodes', () => {
    const res = placing({debug: true}).getBounds({});
    expect(res).toEqual({x: 0, y: 0, w: 0, h: 0});
  });
  test('no placed nodes', () => {
    const res = placing({debug: true}).getBounds({
      'a': {}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 0, h: 0});
  });
  test('first node', () => {
    const res = placing({debug: true}).getBounds({
      'a': {x: 0, y: 0}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 1, h: 1});
  });
  test('one node not 0,0', () => {
    const res = placing({debug: true}).getBounds({
      'a': {x: 5, y: 6}, 'b': {}
    });
    expect(res).toEqual({x: 5, y: 6, w: 1, h: 1});
  });
  test('2 nodes', () => {
    const res = placing({debug: true}).getBounds({
      'a': {x: 0, y: 0}, 'b': {x: 1, y: 1}, 'c': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 2, h: 2});
  });
  test('2 nodes special', () => {
    const res = placing({debug: true}).getBounds({
      'a': {x: 1, y: 2}, 'b': {x: -5, y: 6}, 'c': {}
    });
    expect(res).toEqual({x: -5, y: 2, w: 7, h: 5});
  });
});

describe('getNewPos', () => {
  test('no nodes', () => {
    const res = placing({debug: true}).getNewPos({});
    expect(res).toEqual({x: 0, y: 0});
  });
  test('no placed nodes', () => {
    const res = placing({debug: true}).getNewPos({
      'a': {}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0});
  });
  test('one node', () => {
    const res = placing({debug: true, expand: 'h'}).getNewPos({
      'a': {x: 0, y: 0}, 'b': {}
    });
    expect(res).toEqual({x: 1, y: 0});
  });
  test('one node expand vert', () => {
    const res = placing({debug: true, expand: 'v'}).getNewPos({
      'a': {x: 0, y: 0}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 1});
  });
  test('one node not 0,0', () => {
    const res = placing({debug: true, expand: 'h'}).getNewPos({
      'a': {x: 5, y: 6}, 'b': {}
    });
    expect(res).toEqual({x: 6, y: 6});
  });
  test('2 nodes', () => {
    const res = placing({debug: true, expand: 'h'}).getNewPos({
      'a': {x: 0, y: 0}, 'b': {x: 1, y: 1}
    });
    expect(res).toEqual({x: 1, y: 0});
  });
});

describe('nodeBetween', () => {
  test('only 2 nodes', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(false);
  });
  test('other node not between', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 1}, 'c': {name: 'c', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(false);
  });
  test('between aligned h', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 0}, 'c': {name: 'c', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between aligned v', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 2}, 'c': {name: 'c', x: 0, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between diagonal', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}, 'c': {name: 'c', x: 1, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between diagonal 2', () => {
    const res = placing({debug: true}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 1}, 'c': {name: 'c', x: 1, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
});

describe('getPosition', () => {
  test('free node', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: [],
          afterY: [],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0}
    }, 'a', true);
    expect(res).toEqual({x: null, y: null, free: true});
  });
  test('constrained to another', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: ['b'],
          afterY: [],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0}
    }, 'a', true);
    expect(res).toEqual({x: 1, y: 0, free: false});
  });
  test('double constrained diagonal', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: ['b'],
          afterY: ['c'],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0},
      'c': {x: 2, y: 1}
    }, 'a', true);
    expect(res).toEqual({x: 1, y: 0, free: false});
  });
  test('double constrained no diagonal', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: ['b'],
          afterY: ['c'],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0},
      'c': {x: 2, y: 1}
    }, 'a', false);
    expect(res).toEqual({x: 2, y: 0, free: false});
  });
  test('double constrained impossible', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: ['b'],
          afterY: ['c'],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0},
      'c': {x: 2, y: 10}
    }, 'a', false);
    expect(res).toEqual(null);
  });
});