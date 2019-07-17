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

describe('renderSvgText', () => {
  test('single line', () => {
    const res = rendering().renderSvgText('hello', 1.2, 7.5, 'middle');
    expect(res).toEqual({
      '_text': 'hello'
    });
  });
  test('multi-line', () => {
    const res = rendering().renderSvgText('hello \n there \n general kenobi', 1.2, -7.5, 'end');
    expect(res).toEqual({
      'tspan': [{
        '_attributes': {
          'x': -7.5,
          'dy': 0,
          'text-anchor': 'end'
        },
        '_text': 'hello'
      }, {
        '_attributes': {
          'x': -7.5,
          'dy': '1.2em',
          'text-anchor': 'end'
        },
        '_text': 'there'
      }, {
        '_attributes': {
          'x': -7.5,
          'dy': '1.2em',
          'text-anchor': 'end'
        },
        '_text': 'general kenobi'
      }]
    });
  });
});

describe('font style', () => {
  test('getFontWeight', () => {
    expect(rendering().getFontWeight(undefined)).toBe(undefined);
    expect(rendering().getFontWeight('italic striked')).toBe(undefined);
    expect(rendering().getFontWeight(undefined, true)).toBe(undefined);
    expect(rendering().getFontWeight('italic striked', true)).toBe('normal');
    expect(rendering().getFontWeight('italic striked bold')).toBe('bold');
  });
  test('getFontStyle', () => {
    expect(rendering().getFontStyle(undefined)).toBe(undefined);
    expect(rendering().getFontStyle('bold striked')).toBe(undefined);
    expect(rendering().getFontStyle(undefined, true)).toBe(undefined);
    expect(rendering().getFontStyle('bold striked', true)).toBe('normal');
    expect(rendering().getFontStyle('italic striked bold')).toBe('italic');
    expect(rendering().getFontStyle('italic striked bold oblique')).toBe('italic');
    expect(rendering().getFontStyle('striked bold oblique')).toBe('oblique');
  });
  test('getTextDecoration', () => {
    expect(rendering().getTextDecoration(undefined)).toBe(undefined);
    expect(rendering().getTextDecoration('bold italic')).toBe(undefined);
    expect(rendering().getTextDecoration('italic striked bold')).toBe('line-through');
    expect(rendering().getTextDecoration('italic striked underlined bold')).toBe('underline,line-through');
    expect(rendering().getTextDecoration('overlined underlined')).toBe('underline,overline');
  });
});

describe('renderSubText', () => {
  test('simple text bottom', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('simple text top', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'top', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 -0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': -11.25
        },
        '_text': 'test'
      }
    });
  });
  test('simple text left', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'left', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(-0.2 0) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'end',
          'x': -7.5,
          'y': 3.75
        },
        '_text': 'test'
      }
    });
  });
  test('simple text right', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'right', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0.2 0) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': undefined,
          'x': 7.5,
          'y': 3.75
        },
        '_text': 'test'
      }
    });
  });
  test('link text', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'bottom', {
      text: 'test'
    }, false, true);
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.05) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('multi-line text', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'left', {
      text: 'test1\ntest2\ntest3'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(-0.2 0) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'end',
          'x': -7.5,
          'y': -14.25
        },
        'tspan': [{
          '_attributes': {
            'x': -7.5,
            'dy': 0,
            'text-anchor': 'end'
          },
          '_text': 'test1'
        }, {
          '_attributes': {
            'x': -7.5,
            'dy': '1.2em',
            'text-anchor': 'end'
          },
          '_text': 'test2'
        }, {
          '_attributes': {
            'x': -7.5,
            'dy': '1.2em',
            'text-anchor': 'end'
          },
          '_text': 'test3'
        }]
      }
    });
  });
  test('link text reversed', () => {
    const res = rendering({scale: 1}).renderSubText({}, 'bottom', {
      text: 'test'
    }, true, true);
    expect(res).toEqual({
      '_attributes': {
        'transform': `rotate(180) translate(0 0.05) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('local font size', () => {
    const res = rendering({scale: 1, texts: {'font-size': 20}}).renderSubText({}, 'bottom', {
      text: 'test',
      'font-size': 10
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': 10,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 12.5
        },
        '_text': 'test'
      }
    });
  });
  test('global font size', () => {
    const res = rendering({scale: 1, texts: {'font-size': 20}}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 25
        },
        '_text': 'test'
      }
    });
  });
  test('local margin', () => {
    const res = rendering({scale: 1, texts: {margin: 0.1}}).renderSubText({}, 'bottom', {
      text: 'test',
      margin: 0.3
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.3) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('global margin', () => {
    const res = rendering({scale: 1, texts: {margin: 0.1}}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.1) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('local style', () => {
    const res = rendering({scale: 1, texts: {'font-style': 'italic underlined'}}).renderSubText({}, 'bottom', {
      text: 'test',
      'font-style': 'bold'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': 'bold',
          'font-style': 'normal',
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('global style', () => {
    const res = rendering({scale: 1, texts: {'font-style': 'bold italic underlined'}}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': 'underline',
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('local color', () => {
    const res = rendering({scale: 1, icons: {color: 'red'}, texts: {color: 'black'}}).renderSubText({color: 'green'}, 'bottom', {
      text: 'test',
      color: 'blue'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': 'blue',
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('node/link color', () => {
    const res = rendering({scale: 1, icons: {color: 'red'}, texts: {color: 'black'}}).renderSubText({color: 'green'}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': 'green',
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('global texts color', () => {
    const res = rendering({scale: 1, icons: {color: 'red'}, texts: {color: 'black'}}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': 'black',
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('global node color', () => {
    const res = rendering({scale: 1, icons: {color: 'red'}}).renderSubText({}, 'bottom', {
      text: 'test'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.2) scale(1 1)`,
        'fill': 'red',
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('global link color', () => {
    const res = rendering({scale: 1, links: {color: 'red'}}).renderSubText({}, 'bottom', {
      text: 'test'
    }, false, true);
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(0 0.05) scale(1 1)`,
        'fill': 'red',
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'middle',
          'x': 0,
          'y': 18.75
        },
        '_text': 'test'
      }
    });
  });
  test('local line-height', () => {
    const res = rendering({scale: 1, texts: {'line-height': 1}}).renderSubText({}, 'left', {
      text: 'test1\ntest2',
      'line-height': 1.1
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(-0.2 0) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'end',
          'x': -7.5,
          'y': -4.5
        },
        'tspan': [{
          '_attributes': {
            'x': -7.5,
            'dy': 0,
            'text-anchor': 'end'
          },
          '_text': 'test1'
        }, {
          '_attributes': {
            'x': -7.5,
            'dy': '1.1em',
            'text-anchor': 'end'
          },
          '_text': 'test2'
        }]
      }
    });
  });
  test('global line-height', () => {
    const res = rendering({scale: 1, texts: {'line-height': 1}}).renderSubText({}, 'left', {
      text: 'test1\ntest2'
    });
    expect(res).toEqual({
      '_attributes': {
        'transform': `translate(-0.2 0) scale(1 1)`,
        'fill': undefined,
      },
      'text': {
        '_attributes': {
          'font-family': undefined,
          'font-size': undefined,
          'font-weight': undefined,
          'font-style': undefined,
          'text-decoration': undefined,
          'text-anchor': 'end',
          'x': -7.5,
          'y': -3.75
        },
        'tspan': [{
          '_attributes': {
            'x': -7.5,
            'dy': 0,
            'text-anchor': 'end'
          },
          '_text': 'test1'
        }, {
          '_attributes': {
            'x': -7.5,
            'dy': '1em',
            'text-anchor': 'end'
          },
          '_text': 'test2'
        }]
      }
    });
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
          'fill': undefined
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }]
    });
  });
  test('sub-text', () => {
    const res = rendering({'h-spacing': 1}).renderNode({
      icon: 'circle',
      x: 2,
      y: 1,
      bottom: {
        text: 'hello'
      }
    });
    expect(res).toEqual({
      '_attributes': {'transform': 'translate(2.5 1.5)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': solidCirclePath}}
      }, {
        '_attributes': {
          'transform': `translate(0 0.2) scale(0.0078125 0.0078125)`,
          'fill': undefined,
        },
        'text': {
          '_attributes': {
            'font-family': undefined,
            'font-size': undefined,
            'font-weight': undefined,
            'font-style': undefined,
            'text-decoration': undefined,
            'text-anchor': 'middle',
            'x': 0,
            'y': 18.75
          },
          '_text': 'hello'
        }
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
  test('sub-text bottom/right', () => {
    const exp = {
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }, {
        '_attributes': {
          'transform': `translate(0 0.05) scale(0.0078125 0.0078125)`,
          'fill': undefined,
        },
        'text': {
          '_attributes': {
            'font-family': undefined,
            'font-size': undefined,
            'font-weight': undefined,
            'font-style': undefined,
            'text-decoration': undefined,
            'text-anchor': 'middle',
            'x': 0,
            'y': 18.75
          },
          '_text': 'hello'
        }
      }]
    };
    let res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      bottom: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
    res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      right: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
  });
  test('sub-text top/left', () => {
    const exp = {
      '_attributes': {'transform': 'translate(1 1.5) rotate(0)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }, {
        '_attributes': {
          'transform': `translate(0 -0.05) scale(0.0078125 0.0078125)`,
          'fill': undefined,
        },
        'text': {
          '_attributes': {
            'font-family': undefined,
            'font-size': undefined,
            'font-weight': undefined,
            'font-style': undefined,
            'text-decoration': undefined,
            'text-anchor': 'middle',
            'x': 0,
            'y': -11.25
          },
          '_text': 'hello'
        }
      }]
    };
    let res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      top: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
    res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 0, y: 1}, 'b': {x: 1, y: 1}
    }, {
      from: 'a',
      to: 'b',
      left: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
  });
  test('sub-text reverse bottom/left', () => {
    const exp = {
      '_attributes': {'transform': 'translate(1 1.5) rotate(180)'},
      'g': [{
        '_attributes': {
          'transform': 'scale(0.00078125 0.00078125) translate(-256 -256)',
          'fill': undefined
        },
        'path': {'_attributes': {'d': linkPaths['default'][1]}}
      }, {
        '_attributes': {
          'transform': `rotate(180) translate(0 0.05) scale(0.0078125 0.0078125)`,
          'fill': undefined,
        },
        'text': {
          '_attributes': {
            'font-family': undefined,
            'font-size': undefined,
            'font-weight': undefined,
            'font-style': undefined,
            'text-decoration': undefined,
            'text-anchor': 'middle',
            'x': 0,
            'y': 18.75
          },
          '_text': 'hello'
        }
      }]
    };
    let res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 1, y: 1}, 'b': {x: 0, y: 1}
    }, {
      from: 'a',
      to: 'b',
      bottom: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
    res = rendering({'h-spacing': 1}).renderLink({
      'a': {x: 1, y: 1}, 'b': {x: 0, y: 1}
    }, {
      from: 'a',
      to: 'b',
      left: {
        text: 'hello'
      }
    });
    expect(res).toEqual(exp);
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
    const res = rendering({beautify: true, 'h-spacing': 1, scale: 20}).compute({
      'a': {name: 'a', icon: 'circle', x: 0, y: 0, bottom: 'bottom'},
      'b': {name: 'b', icon: 'circle', x: 1, y: 0}
    }, [
      {from: 'a', to: 'b', top: 'top'}
    ]);
    expect(res.split(solidCirclePath).length).toBe(3); //2 times circle path
    expect(res.includes(linkPaths['default'][1])).toBe(true); // contains simple arrow of width 1
    expect(res.includes('bottom</text>')).toBe(true); // contains bottom text
    expect(res.includes('top</text>')).toBe(true); // contains bottom text
    expect(res.split('</g>').length).toBe(9); //8 groups definitions (2 nodes (x2) + 1 link (x2) + 2 texts)
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