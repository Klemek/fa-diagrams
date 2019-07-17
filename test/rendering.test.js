/* jshint -W117 */
let rendering = require('../src/rendering');
const fs = require('fs');

const solidCirclePath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z';
const regularCirclePath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z';

let linkPaths = {};

/*test('write data', () => {
  const data = {};
  ['default', 'line', 'double', 'split-double', 'dashed', 'dashed-line', 'dashed-double', 'dashed-split-double'].forEach(type => {
    data[type] = {};
    [1, 1.5, 2].forEach(width => {
      data[type][width] = rendering().getLinkPath(type, width);
    });
  });
  fs.writeFileSync('test/link_paths.json', JSON.stringify(data), {encoding: 'utf-8'});
});*/

beforeAll((done) => {

  fs.readFile('test/link_paths.json', {encoding: 'utf-8'}, (err, fileData) => {
    if (!err)
      linkPaths = JSON.parse(fileData);
    done();
  });
});

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
      width: 512,
      height: 512
    });
  });
  test('valid circle alt name', () => {
    const res = rendering().getIcon('fa-circle');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512,
      height: 512
    });
  });
  test('ignored other name', () => {
    const res = rendering().getIcon('circle server');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512,
      height: 512
    });
  });
  test('forcing regular', () => {
    const res = rendering().getIcon('far circle');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512,
      height: 512
    });
  });
  test('forcing regular 2', () => {
    const res = rendering().getIcon('regular circle');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512,
      height: 512
    });
  });
  test('forcing regular 3', () => {
    const res = rendering().getIcon('circle far');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512,
      height: 512
    });
  });
  test('double type', () => {
    const res = rendering().getIcon('circle far solid');
    expect(res).toEqual({
      path: regularCirclePath,
      width: 512,
      height: 512
    });
  });
  test('double type 2', () => {
    const res = rendering().getIcon('circle solid far');
    expect(res).toEqual({
      path: solidCirclePath,
      width: 512,
      height: 512
    });
  });
  test('forcing solid on brands icon', () => {
    const res = rendering().getIcon('usb');
    expect(res).not.toBeNull();
    const res2 = rendering().getIcon('fas usb');
    expect(res2).toBeNull();
  });
  test('custom icon 1', () => {
    const res = rendering().getIcon({
      path: 'hello',
      width: 80,
      height: 160
    });
    expect(res).toEqual({
      path: 'hello',
      width: 80,
      height: 160
    });
  });
  test('custom icon 2', () => {
    const res = rendering().getIcon({
      path: 'hello',
      width: 80
    });
    expect(res).toEqual({
      path: 'hello',
      width: 80,
      height: 80
    });
  });
  test('custom icon 3', () => {
    const res = rendering().getIcon({
      path: 'hello',
      height: 160
    });
    expect(res).toEqual({
      path: 'hello',
      width: 160,
      height: 160
    });
  });
  test('custom icon 4', () => {
    const res = rendering().getIcon({
      path: 'hello'
    });
    expect(res).toEqual({
      path: 'hello',
      width: 512,
      height: 512
    });
  });
  test('custom invalid icon', () => {
    const res = rendering().getIcon({
      paht: 'hello',
      width: 80,
      height: 160
    });
    expect(res).toBe(null);
  });
  test('custom invalid icon 2', () => {
    const res = rendering().getIcon({
      path: '',
      width: 80,
      height: 160
    });
    expect(res).toBe(null);
  });
});

describe('getLinkPath (non-regression)', () => {
  ['default', 'line', 'double', 'split-double', 'dashed', 'dashed-line', 'dashed-double', 'dashed-split-double'].forEach(type => {
    linkPaths[type] = {};
    [1, 1.5, 2].forEach(width => {
      test(type + ' ' + width, () => {
        expect(rendering().getLinkPath(type, width)).toEqual(linkPaths[type][width]);
      });
    });
  });
  test('none', () => {
    expect(rendering().getLinkPath('none', 1)).toEqual(null);
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

describe('renderNode', () => {
  test('no icon', () => {
    const res = rendering({'h-spacing': 1}).renderNode({
      icon: '',
      x: 2,
      y: 1
    });
    expect(res).toBe(null);
  });
  test('simple', () => {
    const res = rendering({'h-spacing': 1}).renderNode({
      icon: 'circle',
      x: 2,
      y: 1
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'stroke': undefined,
          'fill': undefined
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
  test('recolor global', () => {
    const res = rendering({
      'h-spacing': 1,
      'icons': {'color': 'green'}
    }).renderNode({
      icon: 'circle',
      x: 2,
      y: 1
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': 'green'
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
  test('recolor local', () => {
    const res = rendering({
      'h-spacing': 1,
      'icons': {'color': 'green'}
    }).renderNode({
      icon: 'circle',
      x: 2,
      y: 1,
      color: 'red'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': 'red'
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
  test('scale global', () => {
    const res = rendering({
      'h-spacing': 1,
      'icons': {'scale': 512 / 0.4}
    }).renderNode({
      icon: 'circle',
      x: 2,
      y: 1
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(1 1) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
  test('scale local', () => {
    const res = rendering({
      'h-spacing': 1,
      'icons': {'scale': 512 / 0.4}
    }).renderNode({
      icon: 'circle',
      x: 2,
      y: 1,
      scale: 1024 / 0.4
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(2 2) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
});

describe('renderLink', () => {
  test('no link', () => {
    const res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 0}, 'b': {x: 1, y: 0}
    }, {
      from: 'a',
      to: 'b',
      type: 'none'
    });
    expect(res).toBe(null);
  });
  test('simple', () => {
    const res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }]
    });
  });
  test('simple vertical', () => {
    const res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 1, y: 0}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1.5 1) rotate(90)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }]
    });
  });
  test('recolor global', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'color': 'green'}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': 'green'
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }]
    });
  });
  test('recolor local', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'color': 'green'}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      color: 'red'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': 'red'
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }]
    });
  });
  test('scale global', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'scale': 0.5}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.000390625 0.000390625) translate(-512 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][2]}}
      }]
    });
  });
  test('scale local', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'scale': 0.5}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      scale: 1 / 1.5
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.0005208333333333333 0.0005208333333333333) translate(-384 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1.5]}}
      }]
    });
  });
  test('size global', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'size': 1}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 2, y: 1}
    }, {
      from: 'a',
      to: 'b'
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1.5 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }]
    });
  });
  test('size local', () => {
    const res = rendering({
      'h-spacing': 1,
      'links': {'size': 1}
    }).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 2, y: 1}
    }, {
      from: 'a',
      to: 'b',
      size: 2
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(1.5 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-512 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][2]}}
      }]
    });
  });
});

describe('toXML', () => {
  test('no data', () => {
    const res = rendering({scale: 20, 'h-spacing': 1}).toXML({}, {w: 0, h: 0});
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" font-family="Arial" font-size="15" fill="black" stroke-width="0"/>');
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
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500" font-family="Arial" font-size="15" fill="black" stroke-width="0"><circle cx="50" cy="50" r="50"/></svg>');
  });
});

describe('compute', () => {
  test('no nodes no links', () => {
    const res = rendering({beautify: true, 'h-spacing': 1.2, scale: 20}).compute({}, []);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" font-family="Arial" font-size="15" fill="black" stroke-width="0">\n</svg>');
  });
  test('only invisible things', () => {
    const res = rendering({beautify: true, 'h-spacing': 1, scale: 20}).compute({'a': {name: 'a', icon: '', x: 0, y: 0}, 'b': {name: 'b', icon: '', x: 1, y: 0}}, [{from: 'a', to: 'b', type: 'none'}]);
    expect(res).toEqual('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 1" width="100" height="50" font-family="Arial" font-size="15" fill="black" stroke-width="0">\n</svg>');
  });
  test('simple output', () => {
    const res = rendering({beautify: true, 'h-spacing': 1, scale: 20}).compute({'a': {name: 'a', icon: 'circle', x: 0, y: 0}, 'b': {name: 'b', icon: 'circle', x: 1, y: 0}}, [{from: 'a', to: 'b'}]);

    expect(res.split(solidCirclePath).length).toBe(3); //2 times circle path
    expect(res.includes(linkPaths['default'][1])).toBe(true); // contains simple arrow of width 1
    expect(res.split('</g>').length).toBe(7); //6 groups definitions

    expect(res.indexOf('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 1" width="100" height="50" font-family="Arial" font-size="15" fill="black" stroke-width="0">')).toBe(0);
  });
  test('invalid node', () => {
    try {
      rendering().compute({
        'a': {name: 'a', icon: '', x: 0, y: 0}, 'b': {name: 'b', icon: 5}
      }, []);
      fail('no error thrown');
    } catch (err) {
      expect(err).toBe('Node \'b\' is invalid at key \'icon\'');
    }
  });
  test('invalid link', () => {
    try {
      rendering().compute({'a': {name: 'a', icon: '', x: 0, y: 0}, 'b': {name: 'b', icon: '', x: 0, y: 0}}, [{from: 'a', to: 'b'}, {from: 'a', to: 'b', type: 5}]);
      fail('no error thrown');
    } catch (err) {
      expect(err).toBe('Link 1 (a->b) is invalid at key \'type\'');
    }
  });
});