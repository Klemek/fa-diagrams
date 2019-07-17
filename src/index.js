const placing = require('./placing');
const rendering = require('./rendering');

const self = {
  /**
   * @param {{options: Object?, nodes: Object[]?, links: Object[]?}} data
   * @returns {string}
   */
  compute: (data) => {
    const options = data['options'] || {};

    let nodes = {};
    const nodeList = (data['nodes'] || []).filter(n => typeof n.name === 'string');
    nodeList.forEach(n => nodes[n.name] = n);

    let links = (data['links'] || []).filter(l => l.from && l.to);
    links.filter(l => !nodes[l.from]).forEach(l => console.warn(`unknown source node "${l.from}"`));
    links.filter(l => !nodes[l.to]).forEach(l => console.warn(`unknown destination node "${l.to}"`));
    links = links.filter(l => nodes[l.from] && nodes[l.to]);

    nodes = placing(options['placing']).compute(nodes, links);

    if (!nodes)
      throw 'Failed to place nodes';

    return rendering(options['rendering']).compute(nodes, links);
  },
};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify