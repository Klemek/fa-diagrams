const fs = require('fs');

const rendering = require('./src/rendering')({
  'scale': 0.05,
  'h-spacing': 1,
});

['default', 'double', 'line'].forEach(type => {
  fs.writeFileSync(`preview/link-${type}.svg`, rendering.toXML({
    'g': {
      '_attributes': {
        'transform': 'translate(0 -128)'
      },
      'path': {
        '_attributes': {
          'd': rendering.getLinkPath(type, 2)
        }
      }
    }
  }, {w: 1024, h: 256}), {encoding: 'utf-8'});
});

