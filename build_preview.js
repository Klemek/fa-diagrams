const fs = require('fs');
const yaml = require('js-yaml');

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

const faDiagrams = require('./src/index');

const data = {
  nodes: [
    {
      name: 'node1',
      icon: 'laptop-code',
      color: '#4E342E',
      bottom: 'my app'
    },
    {
      name: 'node2',
      icon: 'globe',
      color: '#455A64',
      bottom: 'world'
    }
  ],
  links: [
    {
      from: 'node1',
      to: 'node2',
      color: '#333333',
      top: {icon: 'envelope'},
      bottom: '"hello"'
    }
  ]
};

fs.writeFileSync('docs/sample.yml', yaml.safeDump(data), {encoding: 'utf-8'});

fs.writeFileSync('preview/sample.svg', faDiagrams.compute(data), {encoding: 'utf-8'});