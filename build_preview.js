const fs = require('fs');

const rendering = require('./src/rendering')({
  'scale': 0.05,
  'h-spacing': 1,
  beautify: true,
});

const g = [];

['default', 'line', 'double', 'split-double', 'dashed', 'dashed-line', 'dashed-double', 'dashed-split-double'].forEach((type, i) => {
  g.push({
    'g': {
      '_attributes': {
        'transform': `translate(${(i % 2) * 1536 + 256} ${Math.floor(i / 2) * 712 + 150})`
      },
      'path': {
        '_attributes': {
          'd': rendering.getLinkPath(type, 2)
        }
      },
      'text': {
        '_attributes': {
          'x': 512,
          'y': 0,
          'font-family': 'Verdana',
          'font-size': 120,
          'text-anchor': 'middle'
        },
        '_text': type
      }
    }
  });
});

fs.writeFileSync(`preview/links.svg`, rendering.toXML({'g': g}, {w: 1536 * 2, h: 4 * 712 + 100}), {encoding: 'utf-8'});