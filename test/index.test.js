/* jshint -W117 */
const faDiagrams = require('../src/index');

test('test fail placing', () => {
  const data = {
    options: {
      'placing': {
        'diagonals': false,
      }
    },
    nodes: [
      {name: '1', icon: ''},
      {name: '2', icon: ''},
      {name: '3', icon: ''},
    ],
    links: [
      {from: '1', to: '2', direction: 'left'},
      {from: '1', to: '3', direction: 'left'},
    ]
  };
  try {
    faDiagrams.compute(data);
    fail('no error thrown');
  } catch (err) {
    expect(err).toBe('Failed to place nodes');
  }
});