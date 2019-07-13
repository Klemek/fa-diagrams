/* jshint -W117 */
const placing = require('../src/placing');

describe('getBounds', () => {
  test('no nodes', () => {
    const res = placing({}).getBounds({});
    expect(res).toEqual({x: 0, y: 0, w: 0, h: 0});
  });
  test('no placed nodes', () => {
    const res = placing({}).getBounds({
      'a': {}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 0, h: 0});
  });
  test('first node', () => {
    const res = placing({}).getBounds({
      'a': {x: 0, y: 0}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 1, h: 1});
  });
  test('one node not 0,0', () => {
    const res = placing({}).getBounds({
      'a': {x: 5, y: 6}, 'b': {}
    });
    expect(res).toEqual({x: 5, y: 6, w: 1, h: 1});
  });
  test('2 nodes', () => {
    const res = placing({}).getBounds({
      'a': {x: 0, y: 0}, 'b': {x: 1, y: 1}, 'c': {}
    });
    expect(res).toEqual({x: 0, y: 0, w: 2, h: 2});
  });
  test('2 nodes special', () => {
    const res = placing({}).getBounds({
      'a': {x: 1, y: 2}, 'b': {x: -5, y: 6}, 'c': {}
    });
    expect(res).toEqual({x: -5, y: 2, w: 7, h: 5});
  });
});

describe('getNewPos', () => {
  test('no nodes', () => {
    const res = placing({}).getNewPos({});
    expect(res).toEqual({x: 0, y: 0});
  });
  test('no placed nodes', () => {
    const res = placing({}).getNewPos({
      'a': {}, 'b': {}
    });
    expect(res).toEqual({x: 0, y: 0});
  });
  test('one node', () => {
    const res = placing({}).getNewPos({
      'a': {x: 0, y: 0}, 'b': {}
    });
    expect(res).toEqual({x: 1, y: 0});
  });
  test('one node not 0,0', () => {
    const res = placing({}).getNewPos({
      'a': {x: 5, y: 6}, 'b': {}
    });
    expect(res).toEqual({x: 6, y: 6});
  });
  test('2 nodes', () => {
    const res = placing({}).getNewPos({
      'a': {x: 0, y: 0}, 'b': {x: 1, y: 1}
    });
    expect(res).toEqual({x: 1, y: 0});
  });
});

describe('nodeBetween', () => {
  test('only 2 nodes', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(false);
  });
  test('other node not between', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 1}, 'c': {name: 'c', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(false);
  });
  test('between aligned h', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 0}, 'c': {name: 'c', x: 1, y: 0}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between aligned v', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 2}, 'c': {name: 'c', x: 0, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between diagonal', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}, 'c': {name: 'c', x: 1, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between diagonal 2', () => {
    const res = placing({}).nodeBetween({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 1}, 'c': {name: 'c', x: 1, y: 1}
    }, 'a', 'b');
    expect(res).toBe(true);
  });
  test('between diagonal 3', () => {
    const res = placing({}).nodeBetween({
      '1': {'name': '1', 'x': 1, 'y': 0},
      '2': {'name': '2', 'x': 2, 'y': 0},
      '3': {'name': '3', 'x': 1, 'y': 1},
      '4': {'name': '4', 'x': 2, 'y': 1},
      '5': {'name': '5', 'x': 0, 'y': 0},
      '6': {'name': '6', 'x': 0, 'y': 1}
    }, '4', '5');
    expect(res).toBe(true);
  });
});

describe('getPosition', () => {
  test('free node', () => {
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({'max-link-length': 2}).getPosition({
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
    const res = placing({diagonals: true}).isValid({}, []);
    expect(res).toBe(true);
  });
  test('no placed nodes', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {}, 'b': {}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(true);
  });
  test('one nodes', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(true);
  });
  test('overlapping nodes', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 0, y: 0}
    }, []);
    expect(res).toBe(false);
  });
  test('in between node', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 0}, 'c': {name: 'c', x: 1, y: 0}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(false);
  });
  test('too far node', () => {
    const res = placing({diagonals: true, 'max-link-length': 4}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 4, y: 2}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid right link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: -2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'right'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid left link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'left'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid up link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'up'}
    ]);
    expect(res).toBe(false);
  });
  test('invalid down link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: -2}
    }, [
      {from: 'a', to: 'b', direction: 'down'}
    ]);
    expect(res).toBe(false);
  });
  test('valid right link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'right'}
    ]);
    expect(res).toBe(true);
  });
  test('valid left link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: -2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'left'}
    ]);
    expect(res).toBe(true);
  });
  test('valid up link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: -2}
    }, [
      {from: 'a', to: 'b', direction: 'up'}
    ]);
    expect(res).toBe(true);
  });
  test('valid down link', () => {
    const res = placing({diagonals: true}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b', direction: 'down'}
    ]);
    expect(res).toBe(true);
  });
  test('invalid diagonal link', () => {
    const res = placing({diagonals: false}).isValid({
      'a': {name: 'a', x: 0, y: 0}, 'b': {name: 'b', x: 2, y: 2}
    }, [
      {from: 'a', to: 'b'}
    ]);
    expect(res).toBe(false);
  });
});

describe('correctPlacing', () => {
  test('no nodes', () => {
    const nodes = {};
    placing({}).correctPlacing(nodes);
    expect(nodes).toEqual({});
  });
  test('several nodes', () => {
    const nodes = {
      'a': {x: 3, y: 2},
      'b': {x: -2, y: 5},
      'c': {x: -4, y: 3}
    };
    placing({}).correctPlacing(nodes);
    expect(nodes).toEqual({
      'a': {x: 7, y: 0},
      'b': {x: 2, y: 3},
      'c': {x: 0, y: 1}
    });
  });
});

describe('compute', () => {
  const createNodes = (n) => {
    const nodes = {};
    new Array(n).fill(0).forEach((u, i) => nodes['' + (i + 1)] = {name: '' + (i + 1)});
    return nodes;
  };

  test('no nodes', () => {
    const nodes = placing({'max-link-length': 2, diagonals: false}).compute({}, []);
    expect(nodes).toEqual({});
  });
  test('3 nodes no link', () => {
    const nodes = placing({'max-link-length': 2, diagonals: false}).compute(createNodes(3), []);
    expect(nodes).toEqual({
      '1': {name: '1', x: 0, y: 0},
      '2': {name: '2', x: 1, y: 0},
      '3': {name: '3', x: 0, y: 1}
    });
  });
  test('6 nodes 6 links with directions', () => {
    const nodes = placing({'max-link-length': 2, diagonals: true}).compute(createNodes(6), [
      {from: '1', to: '2', direction: 'right'},
      {from: '1', to: '3', direction: 'down'},
      {from: '3', to: '4', direction: 'right'},
      {from: '4', to: '5', direction: 'up'},
      {from: '3', to: '6', direction: 'left'}
    ]);
    expect(nodes).toEqual({
      '1': {name: '1', x: 0, y: 0},
      '2': {name: '2', x: 1, y: 0},
      '3': {name: '3', x: 1, y: 1},
      '4': {name: '4', x: 2, y: 1},
      '5': {name: '5', x: 2, y: 0},
      '6': {name: '6', x: 0, y: 1}
    });
  });
  test('6 nodes 6 links with directions no diagonals', () => {
    const nodes = placing({'max-link-length': 2, diagonals: false}).compute(createNodes(6), [
      {from: '1', to: '2', direction: 'right'},
      {from: '1', to: '3', direction: 'down'},
      {from: '3', to: '4', direction: 'right'},
      {from: '4', to: '5', direction: 'up'},
      {from: '3', to: '6', direction: 'left'}
    ]);
    expect(nodes).toEqual({
      '1': {name: '1', x: 1, y: 0},
      '2': {name: '2', x: 2, y: 0},
      '3': {name: '3', x: 1, y: 1},
      '4': {name: '4', x: 3, y: 1},
      '5': {name: '5', x: 3, y: 0},
      '6': {name: '6', x: 0, y: 1}
    });
  });
  test('6 nodes 6 links no directions', () => {
    const nodes = placing({'max-link-length': 2, diagonals: true}).compute(createNodes(6), [
      {from: '1', to: '2'},
      {from: '1', to: '3'},
      {from: '3', to: '4'},
      {from: '4', to: '5'},
      {from: '3', to: '6'}
    ]);
    expect(nodes).toEqual({
      '1': {name: '1', x: 0, y: 0},
      '2': {name: '2', x: 1, y: 0},
      '3': {name: '3', x: 1, y: 1},
      '4': {name: '4', x: 2, y: 0},
      '5': {name: '5', x: 2, y: 1},
      '6': {name: '6', x: 0, y: 1}
    });
  });
  test('6 nodes 6 links no directions no diagonals', () => {
    const nodes = placing({'max-link-length': 2, diagonals: false}).compute(createNodes(6), [
      {from: '1', to: '2'},
      {from: '1', to: '3'},
      {from: '3', to: '4'},
      {from: '4', to: '5'},
      {from: '3', to: '6'}
    ]);
    expect(nodes).toEqual({
      '1': {name: '1', x: 0, y: 0},
      '2': {name: '2', x: 0, y: 1},
      '3': {name: '3', x: 1, y: 0},
      '4': {name: '4', x: 1, y: 1},
      '5': {name: '5', x: 2, y: 1},
      '6': {name: '6', x: 2, y: 0}
    });
  });
  test('3 nodes impossible', () => {
    const nodes = placing({'max-link-length': 2, diagonals: false}).compute(createNodes(3), [
      {from: '1', to: '2', direction: 'left'},
      {from: '1', to: '3', direction: 'left'},
    ]);
    expect(nodes).toBeNull();
  });
});