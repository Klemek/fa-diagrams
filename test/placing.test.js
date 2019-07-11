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
  test('constrained to another not placed', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: ['b'],
          afterY: [],
          beforeY: []
        }
      },
      'b': {}
    }, 'a', true);
    expect(res).toEqual({x: null, y: null, free: true});
  });
  test('constrained to another left', () => {
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
  test('constrained to another right', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: ['b'],
          beforeX: [],
          afterY: [],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0}
    }, 'a', true);
    expect(res).toEqual({x: -1, y: 0, free: false});
  });
  test('constrained to another up', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: [],
          afterY: [],
          beforeY: ['b']
        }
      },
      'b': {x: 0, y: 0}
    }, 'a', true);
    expect(res).toEqual({x: 0, y: 1, free: false});
  });
  test('constrained to another down', () => {
    const res = placing({debug: true, 'max-link-length': 2}).getPosition({
      'a': {
        const: {
          afterX: [],
          beforeX: [],
          afterY: ['b'],
          beforeY: []
        }
      },
      'b': {x: 0, y: 0}
    }, 'a', true);
    expect(res).toEqual({x: 0, y: -1, free: false});
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

describe('isValid', () => {
  test('no nodes', () => {
    const res = placing({debug: true}).isValid({}, []);
    expect(res).toBe(true);
  });
  test('no placed nodes', () => {
    const res = placing({debug: true}).isValid({
      'a': {}, 'b': {}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(true);
  });
  test('one nodes', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(true);
  });
  test('overlapping nodes', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 0}
    }, []);
    expect(res).toBe(false);
  });
  test('in between node', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 0}, 'c': {name: 'c', x: 1, y: 0}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid right link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: -2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'right'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid left link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'left'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid up link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'up'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid down link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: -2}
    }, [
      {from: 'a', to: 'b', direction: 'down'}
    ]);
    expect(res).toBe(false);
  });
  test('valid right link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'right'}
    ]);
    expect(res).toBe(true);
  });
  test('valid left link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: -2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'left'}
    ]);
    expect(res).toBe(true);
  });
  test('valid up link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: -2}
    }, [
      {from: 'a', to: 'b', direction: 'up'}
    ]);
    expect(res).toBe(true);
  });
  test('valid down link', () => {
    const res = placing({debug: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'down'}
    ]);
    expect(res).toBe(true);
  });
});

test('no debug (coverage)', () => {
  placing({'max-link-length': 2, 'expand': 'h', diagonals: false}).compute({
    '1': {name: '1'}, '2': {name: '2'}, '3': {name: '3'}, '4': {name: '4'}, '5': {name: '5'}, '6': {name: '6'}
  }, [
    {from: '1', to: '2', direction: 'right'},
    {from: '1', to: '3', direction: 'down'},
    {from: '3', to: '4', direction: 'right'},
    {from: '4', to: '5', direction: 'up'},
    {from: '3', to: '6', direction: 'left'}
  ]);
});