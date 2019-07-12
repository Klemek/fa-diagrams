const faDiagrams = require('./src/index');
const fs = require('fs');

/*const data = {
  options: {
    font: 'Courier New'
  },
  nodes: [
    {
      name: 'node1',
      icon: 'server',
      bottom: {text: 'myserver' },
      top: {icon: 'node'}
    },
    {
      name: 'node2',
      icon: 'globe',
      bottom: {text: 'world'}
    }
  ],
  links: [
    {
      type: 'arrow',
      from: 'node1',
      to: 'node2',
      direction: 'right',
      bottom: {text: 'Hello World!'}
    }
  ]
};*/

const data = {
  options: {
    rendering: {
      beautify: true
    },
    placing: {
      diagonals: true
    }
  },
  nodes: [
    {
      name: '1',
      icon: 'circle',
    },
    {
      name: '2',
      icon: 'circle'
    },
    {
      name: '3',
      icon: 'circle'
    },
    {
      name: '4',
      icon: 'circle'
    },
    {
      name: '5',
      icon: 'circle'
    },
    {
      name: '6',
      icon: 'circle'
    },
  ],
  links: [
    {from: '1', to: '2', direction: 'right', type: ''},
    {from: '1', to: '3', direction: 'down', type: ''},
    {from: '3', to: '4', direction: 'right', type: ''},
    {from: '4', to: '5', direction: 'up', type: 'double'},
    {from: '3', to: '6', direction: 'left', type: ''}
  ]
};

fs.writeFileSync('out.svg', faDiagrams.compute(data), {encoding: 'utf-8'});

const rendering = require('./src/rendering')({
  'beautify': false,
  'scale': 1,
  'h-spacing': 1,
  'icons': {
    'scale': 0.1
  },
  'links': {
    'scale': 1
  },
});

const g = [];

let y = 0;

for (let i = 0; i < 20; i++) {
  if (i % 5 === 0)
    y = 0;
  ['', 'double', 'line'].forEach(type => {
    g.push({
      '_attributes': {
        'transform': `translate(${Math.pow(Math.floor(i / 5), 1.6) * 720} ${256 * (y++)})`
      },
      'path': {
        '_attributes': {
          'd': rendering.getLinkPath(type, (i + 1) / 5)
        }
      }
    });
  });

}

fs.writeFileSync('out2.svg', rendering.toXML({g: g}, {w: 7000, h: 256 * 16}), {encoding: 'utf-8'});
